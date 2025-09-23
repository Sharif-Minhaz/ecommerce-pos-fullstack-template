"use server";

import { connectToDatabase } from "@/db";
import { Review } from "@/models/ReviewModel";
import { Product } from "@/models/ProductModel";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";
import { convertToPlaintObject } from "@/lib/utils";
import { notificationFactory } from "@/lib/notification-factory";
import { vendorEmailIntegration } from "@/lib/email-integration";

// =============== list reviews for a product (public) ================
export async function listProductReviews(productId: string) {
	try {
		await connectToDatabase();
		const reviews = await Review.find({ product: productId })
			.populate("user", "name image")
			.sort({ createdAt: -1 });
		return { success: true, reviews: convertToPlaintObject(reviews) };
	} catch (error: unknown) {
		if (error instanceof Error) return { success: false, error: error.message };
		return { success: false, error: "An unknown error occurred" };
	}
}

// =============== create or update own review ================
export async function upsertReview(productId: string, formData: FormData) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) throw new Error("User not authenticated");

		await connectToDatabase();

		const product = await Product.findById(productId);
		if (!product) throw new Error("Product not found");

		const rating = Number(formData.get("rating"));
		const reviewText = (formData.get("review") as string) || "";
		if (!rating || rating < 1 || rating > 5) throw new Error("Invalid rating");
		if (!reviewText.trim()) throw new Error("Review is required");

		const review = await Review.findOneAndUpdate(
			{ product: productId, user: session.user.id },
			{ rating, review: reviewText.trim() },
			{ upsert: true, new: true, setDefaultsOnInsert: true }
		);

		revalidatePath(`/products/${product.slug}`);

		// =============== notify vendor about new/updated review ================
		try {
			const vendorId = String(product.vendor);
			await notificationFactory.productReview(vendorId, product.title, rating, session.user.name || "Customer");
			// optional email
			const vendorUser = await (
				await import("@/models/UserModel")
			).User.findById(product.vendor).select("email name");
			if (vendorUser?.email) {
				await vendorEmailIntegration.sendLowStockEmail?.(vendorUser.email, product.title, rating);
			}
		} catch (err) {
			console.error("Vendor review notification/email failed:", err);
		}
		return { success: true, review: convertToPlaintObject(review) };
	} catch (error: unknown) {
		if (error instanceof Error) return { success: false, error: error.message };
		return { success: false, error: "An unknown error occurred" };
	}
}

// =============== delete own review ================
export async function deleteOwnReview(productId: string) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) throw new Error("User not authenticated");

		await connectToDatabase();
		const product = await Product.findById(productId).select("slug");
		if (!product) throw new Error("Product not found");

		await Review.findOneAndDelete({ product: productId, user: session.user.id });
		revalidatePath(`/products/${product.slug}`);
		return { success: true };
	} catch (error: unknown) {
		if (error instanceof Error) return { success: false, error: error.message };
		return { success: false, error: "An unknown error occurred" };
	}
}
