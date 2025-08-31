"use server";

import { Product } from "@/models/ProductModel";
import { connectToDatabase } from "@/db";

// =============== get products by vendor ================
export async function getProductsByVendor(vendorId: string) {
	try {
		await connectToDatabase();

		// Find all products by vendor ID and populate necessary fields
		const products = await Product.find({
			vendor: vendorId,
			isActive: true,
		})
			.populate("category", "name nameBN slug")
			.populate("brand", "name nameBN slug")
			.populate("vendor", "name shopName registrationNumber")
			.sort({ createdAt: -1 });

		return { success: true, products };
	} catch (error: unknown) {
		if (error instanceof Error) {
			return { success: false, error: error.message };
		}
		return { success: false, error: "An unknown error occurred" };
	}
}
