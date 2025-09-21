"use server";

import { connectToDatabase } from "@/db";
import { Sales } from "@/models/SalesModel";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";
import { Types } from "mongoose";
import { Product } from "@/models/ProductModel";
import { convertToPlaintObject } from "@/lib/utils";

type CreateOrderItem = {
	productId: string;
	quantity: number;
	unitPrice: number;
};

export type CreateOrderInput = {
	items: CreateOrderItem[];
	deliveryDetails: {
		address: string;
		city: string;
		postalCode: string;
		phone: string;
		name?: string;
		email?: string;
	};
	paymentMethod: "cod" | "stripe" | "sslcommerz" | "cash";
	deliveryCharge: number;
	couponDiscount?: number;
	discount?: number;
	taxAmount?: number;
};

export async function createSalesOrder(input: CreateOrderInput) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) throw new Error("User not authenticated");

		await connectToDatabase();

		if (!input.items || input.items.length === 0) throw new Error("Order must have at least one item");

		const items = input.items.map((item) => ({
			product: new Types.ObjectId(item.productId),
			quantity: item.quantity,
			unitPrice: item.unitPrice,
			totalPrice: item.unitPrice * item.quantity,
		}));

		const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
		const discount = input.discount ?? 0;
		const couponDiscount = input.couponDiscount ?? 0;
		const taxAmount = input.taxAmount ?? 0;
		const finalSubtotal = subtotal - discount - couponDiscount;
		const totalAmount = finalSubtotal + input.deliveryCharge + taxAmount;

		const sales = await Sales.create({
			orderNumber: crypto.randomUUID(),
			orderName: `Order by ${session.user.name || session.user.email || "user"}`,
			items,
			actualPrice: subtotal,
			deliveryCharge: input.deliveryCharge,
			subtotal: finalSubtotal,
			discount,
			couponDiscount,
			totalAmount,
			paymentMethod: input.paymentMethod,
			status: "pending",
			user: new Types.ObjectId(session.user.id),
			deliveryDetails: {
				name: input.deliveryDetails.name || session.user.name || "",
				phone: input.deliveryDetails.phone,
				email: input.deliveryDetails.email || session.user.email || "",
				address: input.deliveryDetails.address,
				city: input.deliveryDetails.city,
				postalCode: input.deliveryDetails.postalCode,
				country: "Bangladesh",
			},
			paid: 0,
			due: totalAmount,
			taxAmount,
		});

		revalidatePath("/my-orders");

		return { success: true, order: { _id: String(sales._id), orderNumber: sales.orderNumber } };
	} catch (error: unknown) {
		if (error instanceof Error) return { success: false, error: error.message };
		return { success: false, error: "An unknown error occurred" };
	}
}

export async function getMyOrders() {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) throw new Error("User not authenticated");
		await connectToDatabase();
		const orders = await Sales.find({ user: session.user.id })
			.populate({ path: "items.product", select: "title gallery" })
			.sort({ createdAt: -1 });
		return { success: true, orders: convertToPlaintObject(orders) };
	} catch (error: unknown) {
		if (error instanceof Error) return { success: false, error: error.message };
		return { success: false, error: "An unknown error occurred" };
	}
}

export async function getVendorOrders() {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) throw new Error("User not authenticated");
		if (session.user.userType !== "vendor") throw new Error("Access denied. Vendor account required.");
		await connectToDatabase();
		// Fetch orders that include items belonging to this vendor's products
		const orders = await Sales.find({})
			.populate({
				path: "items.product",
				select: "title vendor",
			})
			.populate({
				path: "assignedRider",
				select: "user rating status vehicleInfo serviceAreas",
				populate: { path: "user", select: "name phoneNumber" },
			})
			.sort({ createdAt: -1 });

		const filtered = orders.filter((order: { items: Array<{ product?: { vendor?: string } }> }) =>
			order.items.some((item) => String(item.product?.vendor) === String(session.user.id))
		);
		return { success: true, orders: convertToPlaintObject(filtered) };
	} catch (error: unknown) {
		if (error instanceof Error) return { success: false, error: error.message };
		return { success: false, error: "An unknown error occurred" };
	}
}

// =============== POS: create manual sale (vendor, delivered) and decrement stock ================
export type CreatePosSaleInput = {
	items: { productId: string; quantity: number; unitPrice: number }[];
	customerName?: string;
	customerPhone?: string;
	customerEmail?: string;
	customerAddress?: string;
	customerCity?: string;
	customerPostalCode?: string;
	notes?: string;
	deliveryCharge?: number;
	discount?: number;
	taxAmount?: number;
	paymentMethod?: "cod" | "stripe" | "sslcommerz" | "cash";
	totalOverride?: number; // allow editing overall price
};

export async function createPosSale(input: CreatePosSaleInput) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) throw new Error("User not authenticated");
		if (session.user.userType !== "vendor") throw new Error("Access denied. Vendor account required.");

		await connectToDatabase();

		if (!input.items || input.items.length === 0) throw new Error("Sale must have at least one item");

		// verify products belong to vendor and have sufficient stock
		const productIds = input.items.map((i) => i.productId);
		const products = await Product.find({ _id: { $in: productIds }, vendor: session.user.id });
		const productMap = new Map(products.map((p) => [String(p._id), p]));

		for (const item of input.items) {
			const productItem = productMap.get(item.productId);
			if (!productItem) throw new Error("Product not found or not owned by vendor");
			if (typeof item.quantity !== "number" || item.quantity <= 0) throw new Error("Invalid quantity");
			if (productItem.stock < item.quantity)
				throw new Error(`Insufficient stock for product ${productItem.title}`);
		}

		const items = input.items.map((item) => ({
			product: new Types.ObjectId(item.productId),
			quantity: item.quantity,
			unitPrice: item.unitPrice,
			totalPrice: item.unitPrice * item.quantity,
		}));

		const rawSubtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
		const deliveryCharge = input.deliveryCharge ?? 0;
		const discount = input.discount ?? 0;
		const taxAmount = input.taxAmount ?? 0;
		const computedSubtotal = rawSubtotal - discount;
		let totalAmount = computedSubtotal + deliveryCharge + taxAmount;
		if (typeof input.totalOverride === "number" && input.totalOverride >= 0) {
			totalAmount = input.totalOverride;
		}

		// =============== check delivery and customer info independently ================
		const hasDeliveryInfo = input.customerAddress || input.customerCity || input.customerPostalCode;
		const hasCustomerInfo = input.customerName || input.customerPhone || input.customerEmail;

		const salesData: {
			orderNumber: string;
			orderName: string;
			items: Array<{
				product: Types.ObjectId;
				quantity: number;
				unitPrice: number;
				totalPrice: number;
			}>;
			actualPrice: number;
			deliveryCharge: number;
			subtotal: number;
			discount: number;
			couponDiscount: number;
			totalAmount: number;
			paymentMethod: string;
			status: string;
			user: Types.ObjectId;
			paid: number;
			due: number;
			taxAmount: number;
			notes?: string;
			isPaid: boolean;
			isDelivered: boolean;
			deliveryDetails?: {
				name: string;
				phone: string;
				email: string;
				address: string;
				city: string;
				postalCode: string;
				country: string;
			};
		} = {
			orderNumber: crypto.randomUUID(),
			orderName: hasCustomerInfo ? `POS Sale - ${input.customerName || "Customer"}` : "POS Sale",
			items,
			actualPrice: rawSubtotal,
			deliveryCharge,
			subtotal: computedSubtotal,
			discount,
			couponDiscount: 0,
			totalAmount,
			paymentMethod: input.paymentMethod ?? "cash",
			status: "delivered", // POS sales are considered delivered
			user: new Types.ObjectId(session.user.id),
			paid: totalAmount,
			due: 0,
			taxAmount,
			notes: input.notes,
			isPaid: true,
			isDelivered: true,
		};

		// =============== add delivery details if delivery info is provided (independent of customer info) ================
		if (hasDeliveryInfo) {
			salesData.deliveryDetails = {
				name: input.customerName || "Walk-in Customer",
				phone: input.customerPhone || "",
				email: input.customerEmail || "",
				address: input.customerAddress || "",
				city: input.customerCity || "",
				postalCode: input.customerPostalCode || "",
				country: "Bangladesh",
			};
		}

		const sales = await Sales.create(salesData);

		// decrement stock
		for (const item of input.items) {
			await Product.updateOne(
				{ _id: item.productId, vendor: session.user.id },
				{ $inc: { stock: -Math.abs(item.quantity) } }
			);
		}

		revalidatePath("/pos");
		revalidatePath("/my-shop");

		return { success: true, order: { _id: String(sales._id), orderNumber: sales.orderNumber } };
	} catch (error: unknown) {
		if (error instanceof Error) return { success: false, error: error.message };
		return { success: false, error: "An unknown error occurred" };
	}
}

// =============== POS: get delivered sales for current vendor ================
export async function getVendorDeliveredSales() {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) throw new Error("User not authenticated");
		if (session.user.userType !== "vendor") throw new Error("Access denied. Vendor account required.");

		await connectToDatabase();
		const orders = await Sales.find({ user: session.user.id, status: "delivered" })
			.populate({ path: "items.product", select: "title sku" })
			.sort({ createdAt: -1 });
		return { success: true, orders: convertToPlaintObject(orders) };
	} catch (error: unknown) {
		if (error instanceof Error) return { success: false, error: error.message };
		return { success: false, error: "An unknown error occurred" };
	}
}

export async function updateOrderStatus(formData: FormData) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) throw new Error("User not authenticated");
		if (session.user.userType !== "vendor") throw new Error("Access denied. Vendor account required.");
		await connectToDatabase();

		const orderId = formData.get("orderId") as string;
		const status = formData.get("status") as string;
		if (!orderId || !status) throw new Error("Invalid data");

		const order = await Sales.findById(orderId);
		if (!order) throw new Error("Order not found");

		order.status = status as typeof order.status;
		order.updateDeliveryStatus();
		await order.save();

		revalidatePath("/my-shop/manage-orders");
	} catch (error: unknown) {
		console.error("Failed to update order status:", error);
	}
}
