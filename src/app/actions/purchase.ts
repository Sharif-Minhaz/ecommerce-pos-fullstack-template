"use server";

import { connectToDatabase } from "@/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Purchase } from "@/models/PurchaseModel";
import { Product } from "@/models/ProductModel";
import { Types } from "mongoose";
import { revalidatePath } from "next/cache";
import { convertToPlaintObject } from "@/lib/utils";

export type CreatePosPurchaseInput = {
	items: Array<{ productId?: string; title?: string; sku?: string; quantity: number; purchasePrice: number }>;
	deliveryCharge?: number;
	discount?: number;
	discountType?: "percentage" | "flat";
	vat?: number;
	paid?: number;
	supplierDetails: {
		name: string;
		phone: string;
		address: string;
		city: string;
		postalCode: string;
		country?: string;
		shopName: string;
		email?: string;
	};
	notes?: string;
};

// =============== POS: record purchase and upsert product stock ================
export async function createPosPurchase(input: CreatePosPurchaseInput) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) throw new Error("User not authenticated");
		if (session.user.userType !== "vendor") throw new Error("Access denied. Vendor account required.");

		await connectToDatabase();

		if (!input.items || input.items.length === 0) throw new Error("Purchase must have at least one item");

		// for each item: if productId provided and belongs to vendor -> increment stock
		// else if sku/title provided -> try find by sku for this vendor
		// if not found -> create minimal product with vendor and increment stock
		type ResolvedItem = { product: Types.ObjectId; quantity: number; purchasePrice: number; totalPrice: number };
		const resolvedItems: ResolvedItem[] = [];

		for (const it of input.items) {
			if (!it.quantity || it.quantity <= 0) throw new Error("Invalid quantity");
			if (it.purchasePrice == null || it.purchasePrice < 0) throw new Error("Invalid purchase price");

			let productDoc: typeof Product.prototype | null = null;
			if (it.productId) {
				productDoc = await Product.findOne({ _id: it.productId, vendor: session.user.id });
			} else if (it.sku) {
				productDoc = await Product.findOne({ sku: it.sku, vendor: session.user.id });
			}

			if (!productDoc && (it.title || it.sku)) {
				// create minimal product entry
				const title = it.title || `Unnamed Product ${Date.now()}`;
				const sku = it.sku || `SKU-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
				productDoc = await Product.create({
					title,
					titleBN: title,
					description: "Auto-created from POS purchase",
					descriptionBN: "Auto-created from POS purchase",
					unit: "pcs",
					stock: 0,
					price: it.purchasePrice,
					highlights: title,
					highlightsBN: title,
					specification: title,
					specificationBN: title,
					category: new Types.ObjectId(),
					brand: new Types.ObjectId(),
					vendor: new Types.ObjectId(session.user.id),
					sku,
					gallery: ["https://via.placeholder.com/600x400?text=Product"],
					isActive: true,
				});
			}

			if (!productDoc) throw new Error("Product not found and insufficient data to create");

			await Product.updateOne({ _id: productDoc._id }, { $inc: { stock: Math.abs(it.quantity) } });
			resolvedItems.push({
				product: new Types.ObjectId(productDoc._id),
				quantity: it.quantity,
				purchasePrice: it.purchasePrice,
				totalPrice: it.quantity * it.purchasePrice,
			});
		}

		const subtotal = resolvedItems.reduce((s, i) => s + i.totalPrice, 0);
		const discount = input.discount ?? 0;
		const deliveryCharge = input.deliveryCharge ?? 0;
		const vat = input.vat ?? 0;
		const discountAmount = input.discountType === "percentage" ? (subtotal * discount) / 100 : discount;
		const finalSubtotal = subtotal - discountAmount;
		const vatAmount = (finalSubtotal * vat) / 100;
		const totalAmount = finalSubtotal + vatAmount + deliveryCharge;
		const paid = input.paid ?? 0;
		const due = Math.max(0, totalAmount - paid);

		const purchase = await Purchase.create({
			items: resolvedItems,
			subtotal,
			discount,
			discountType: input.discountType ?? "flat",
			vat,
			deliveryCharge,
			totalAmount,
			paymentStatus: paid >= totalAmount ? "paid" : paid > 0 ? "partial" : "pending",
			purchaseStatus: "received",
			vendor: new Types.ObjectId(session.user.id),
			supplierDetails: {
				...input.supplierDetails,
				country: input.supplierDetails.country || "Bangladesh",
			},
			paid,
			due,
			notes: input.notes,
			actualDeliveryDate: new Date(),
		});

		revalidatePath("/pos");
		revalidatePath("/my-shop");

		return { success: true, purchase: { _id: String(purchase._id), purchaseNumber: purchase.purchaseNumber } };
	} catch (error: unknown) {
		if (error instanceof Error) return { success: false, error: error.message };
		return { success: false, error: "An unknown error occurred" };
	}
}

// =============== POS: list purchases for current vendor ================
export async function getVendorPurchases() {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) throw new Error("User not authenticated");
		if (session.user.userType !== "vendor") throw new Error("Access denied. Vendor account required.");

		await connectToDatabase();
		const purchases = await Purchase.find({ vendor: session.user.id })
			.populate({ path: "items.product", select: "title sku" })
			.sort({ createdAt: -1 });
		return { success: true, purchases: convertToPlaintObject(purchases) };
	} catch (error: unknown) {
		if (error instanceof Error) return { success: false, error: error.message };
		return { success: false, error: "An unknown error occurred" };
	}
}
