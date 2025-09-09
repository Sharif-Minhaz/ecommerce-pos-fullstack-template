"use server";

import { connectToDatabase } from "@/db";
import { Sales } from "@/models/SalesModel";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";
import { Types } from "mongoose";

type CreateOrderItem = {
	productId: string;
	quantity: number;
	unitPrice: number;
};

type CreateOrderInput = {
	items: CreateOrderItem[];
	deliveryDetails: {
		address: string;
		city: string;
		postalCode: string;
		phone: string;
		name?: string;
		email?: string;
	};
	paymentMethod: "cod" | "stripe" | "sslcommerz";
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

		const items = input.items.map((it) => ({
			product: new Types.ObjectId(it.productId),
			quantity: it.quantity,
			unitPrice: it.unitPrice,
			totalPrice: it.unitPrice * it.quantity,
		}));

		const subtotal = items.reduce((sum, i) => sum + i.totalPrice, 0);
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
		return { success: true, orders: JSON.parse(JSON.stringify(orders)) };
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
			.sort({ createdAt: -1 });

		const filtered = orders.filter((o: { items: Array<{ product?: { vendor?: string } }> }) =>
			o.items.some((it) => String(it.product?.vendor) === String(session.user.id))
		);
		return { success: true, orders: JSON.parse(JSON.stringify(filtered)) };
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
