"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/db";
import { User } from "@/models/UserModel";
import { Product } from "@/models/ProductModel";
import { convertToPlaintObject } from "@/lib/utils";

// =============== get wishlist product ids ================
export async function getWishlistIds() {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) return { success: false, error: "Not authenticated" };
	await connectToDatabase();
	const me = await User.findById(session.user.id).select("wishlist");
	const ids = (me?.wishlist || []).map((id: unknown) => String(id));
	return { success: true, ids };
}

// =============== get wishlist products (populated) ================
export async function getWishlistProducts() {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) return { success: false, error: "Not authenticated" };
	await connectToDatabase();
	const me = await User.findById(session.user.id).select("wishlist");
	const wishlistIds: string[] = (me?.wishlist || []).map((id: unknown) => String(id));
	if (wishlistIds.length === 0) return { success: true, products: [] };
	const products = await Product.find({ _id: { $in: wishlistIds } })
		.populate("brand", "name")
		.populate("category", "name")
		.sort({ createdAt: -1 });
	return { success: true, products: convertToPlaintObject(products) };
}

// =============== add to wishlist ================
export async function addToWishlist(productId: string) {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) return { success: false, error: "Not authenticated" };
	await connectToDatabase();
	await User.findByIdAndUpdate(session.user.id, { $addToSet: { wishlist: productId } }, { new: true });
	return { success: true };
}

// =============== remove from wishlist ================
export async function removeFromWishlist(productId: string) {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) return { success: false, error: "Not authenticated" };
	await connectToDatabase();
	await User.findByIdAndUpdate(session.user.id, { $pull: { wishlist: productId } }, { new: true });
	return { success: true };
}
