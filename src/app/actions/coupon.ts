"use server";

import { Coupon } from "@/models/CouponModel";
import { User } from "@/models/UserModel";
import { connectToDatabase } from "@/db";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { convertToPlaintObject } from "@/lib/utils";

// =============== create coupon ================
export async function createCoupon(formData: FormData) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.email) {
			throw new Error("User not authenticated");
		}

		await connectToDatabase();

		// =============== check if user is vendor ================
		const user = await User.findOne({ email: session.user.email }).select("-password");
		if (!user || user.userType !== "vendor") {
			throw new Error("Access denied. Vendor account required.");
		}

		const name = formData.get("name") as string;
		const nameBN = formData.get("nameBN") as string;
		const description = formData.get("description") as string;
		const descriptionBN = formData.get("descriptionBN") as string;
		const code = formData.get("code") as string;
		const validTill = formData.get("validTill") as string;
		const amount = parseFloat(formData.get("amount") as string);
		const type = formData.get("type") as "percentage" | "flat";
		const minPurchase = formData.get("minPurchase") ? parseFloat(formData.get("minPurchase") as string) : undefined;
		const maxDiscount = formData.get("maxDiscount") ? parseFloat(formData.get("maxDiscount") as string) : undefined;

		// =============== validate required fields ================
		if (!name || !nameBN || !description || !descriptionBN || !code || !validTill || !amount || !type) {
			throw new Error("All required fields must be filled");
		}

		// =============== check if coupon code already exists ================
		const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
		if (existingCoupon) {
			throw new Error("Coupon code already exists");
		}

		// =============== create coupon ================
		const coupon = await Coupon.create({
			vendorId: user._id,
			name,
			nameBN,
			description,
			descriptionBN,
			code: code.toUpperCase(),
			validTill: new Date(validTill),
			amount,
			type,
			minPurchase,
			maxDiscount,
			isActive: true,
		});

		revalidatePath("/my-shop/coupons");
		return { success: true, coupon: convertToPlaintObject(coupon) };
	} catch (error: unknown) {
		if (error instanceof Error) {
			return { success: false, error: error.message };
		}
		return { success: false, error: "An unknown error occurred" };
	}
}

// =============== get vendor coupons ================
export async function getVendorCoupons() {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.email) {
			throw new Error("User not authenticated");
		}

		await connectToDatabase();

		// =============== check if user is vendor ================
		const user = await User.findOne({ email: session.user.email }).select("-password");
		if (!user || user.userType !== "vendor") {
			throw new Error("Access denied. Vendor account required.");
		}

		const coupons = await Coupon.find({ vendorId: user._id }).sort({ createdAt: -1 }).lean();

		return { success: true, coupons: convertToPlaintObject(coupons) };
	} catch (error: unknown) {
		if (error instanceof Error) {
			return { success: false, error: error.message };
		}
		return { success: false, error: "An unknown error occurred" };
	}
}

// =============== get single coupon ================
export async function getCouponById(couponId: string) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.email) {
			throw new Error("User not authenticated");
		}

		await connectToDatabase();

		// =============== check if user is vendor ================
		const user = await User.findOne({ email: session.user.email }).select("-password");
		if (!user || user.userType !== "vendor") {
			throw new Error("Access denied. Vendor account required.");
		}

		const coupon = await Coupon.findOne({ _id: couponId, vendorId: user._id }).lean();
		if (!coupon) {
			throw new Error("Coupon not found");
		}

		return { success: true, coupon: convertToPlaintObject(coupon) };
	} catch (error: unknown) {
		if (error instanceof Error) {
			return { success: false, error: error.message };
		}
		return { success: false, error: "An unknown error occurred" };
	}
}

// =============== update coupon ================
export async function updateCoupon(couponId: string, formData: FormData) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.email) {
			throw new Error("User not authenticated");
		}

		await connectToDatabase();

		// =============== check if user is vendor ================
		const user = await User.findOne({ email: session.user.email }).select("-password");
		if (!user || user.userType !== "vendor") {
			throw new Error("Access denied. Vendor account required.");
		}

		const name = formData.get("name") as string;
		const nameBN = formData.get("nameBN") as string;
		const description = formData.get("description") as string;
		const descriptionBN = formData.get("descriptionBN") as string;
		const code = formData.get("code") as string;
		const validTill = formData.get("validTill") as string;
		const amount = parseFloat(formData.get("amount") as string);
		const type = formData.get("type") as "percentage" | "flat";
		const minPurchase = formData.get("minPurchase") ? parseFloat(formData.get("minPurchase") as string) : undefined;
		const maxDiscount = formData.get("maxDiscount") ? parseFloat(formData.get("maxDiscount") as string) : undefined;

		// =============== validate required fields ================
		if (!name || !nameBN || !description || !descriptionBN || !code || !validTill || !amount || !type) {
			throw new Error("All required fields must be filled");
		}

		// =============== check if coupon exists and belongs to vendor ================
		const existingCoupon = await Coupon.findOne({ _id: couponId, vendorId: user._id });
		if (!existingCoupon) {
			throw new Error("Coupon not found");
		}

		// =============== check if new code already exists (excluding current coupon) ================
		const codeExists = await Coupon.findOne({
			code: code.toUpperCase(),
			_id: { $ne: couponId },
		});
		if (codeExists) {
			throw new Error("Coupon code already exists");
		}

		// =============== update coupon ================
		const updatedCoupon = await Coupon.findOneAndUpdate(
			{ _id: couponId, vendorId: user._id },
			{
				name,
				nameBN,
				description,
				descriptionBN,
				code: code.toUpperCase(),
				validTill: new Date(validTill),
				amount,
				type,
				minPurchase,
				maxDiscount,
			},
			{ new: true, runValidators: true }
		);

		if (!updatedCoupon) {
			throw new Error("Failed to update coupon");
		}

		revalidatePath("/my-shop/coupons");
		return { success: true, coupon: convertToPlaintObject(updatedCoupon) };
	} catch (error: unknown) {
		if (error instanceof Error) {
			return { success: false, error: error.message };
		}
		return { success: false, error: "An unknown error occurred" };
	}
}

// =============== toggle coupon status ================
export async function toggleCouponStatus(couponId: string) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.email) {
			throw new Error("User not authenticated");
		}

		await connectToDatabase();

		// =============== check if user is vendor ================
		const user = await User.findOne({ email: session.user.email }).select("-password");
		if (!user || user.userType !== "vendor") {
			throw new Error("Access denied. Vendor account required.");
		}

		const coupon = await Coupon.findOne({ _id: couponId, vendorId: user._id });
		if (!coupon) {
			throw new Error("Coupon not found");
		}

		const updatedCoupon = await Coupon.findOneAndUpdate(
			{ _id: couponId, vendorId: user._id },
			{ isActive: !coupon.isActive },
			{ new: true, runValidators: true }
		);

		if (!updatedCoupon) {
			throw new Error("Failed to update coupon status");
		}

		revalidatePath("/my-shop/coupons");
		return { success: true, coupon: convertToPlaintObject(updatedCoupon) };
	} catch (error: unknown) {
		if (error instanceof Error) {
			return { success: false, error: error.message };
		}
		return { success: false, error: "An unknown error occurred" };
	}
}

// =============== delete coupon ================
export async function deleteCoupon(couponId: string) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.email) {
			throw new Error("User not authenticated");
		}

		await connectToDatabase();

		// =============== check if user is vendor ================
		const user = await User.findOne({ email: session.user.email }).select("-password");
		if (!user || user.userType !== "vendor") {
			throw new Error("Access denied. Vendor account required.");
		}

		const deletedCoupon = await Coupon.findOneAndDelete({ _id: couponId, vendorId: user._id });
		if (!deletedCoupon) {
			throw new Error("Coupon not found");
		}

		revalidatePath("/my-shop/coupons");
		return { success: true };
	} catch (error: unknown) {
		if (error instanceof Error) {
			return { success: false, error: error.message };
		}
		return { success: false, error: "An unknown error occurred" };
	}
}

// =============== validate coupon for checkout ================
export async function validateCoupon(code: string, cartItems: any[], userId?: string) {
	try {
		await connectToDatabase();

		const coupon = (await Coupon.findOne({
			code: code.toUpperCase(),
			isActive: true,
			validTill: { $gt: new Date() },
		}).lean()) as any;

		if (!coupon) {
			throw new Error("Invalid or expired coupon");
		}

		// =============== check if user has already used this coupon ================
		if (userId) {
			const user = await User.findById(userId).select("usedCoupons");
			if (
				user?.usedCoupons?.some(
					(used: { couponId: string }) => used.couponId.toString() === coupon._id.toString()
				)
			) {
				throw new Error("You have already used this coupon");
			}
		}

		// =============== filter cart items by coupon vendor ================
		// supports multiple shapes for vendor on product: vendor (id string), vendor (populated {_id}), or legacy vendorId
		const vendorItems = cartItems.filter((item: { product: { vendor?: string; vendorId?: string } }) => {
			const vendorRef = item.product.vendor ?? item.product.vendorId;
			const productVendorId = (vendorRef?._id ?? vendorRef)?.toString?.();
			return productVendorId && productVendorId === coupon.vendorId.toString();
		});

		if (vendorItems.length === 0) {
			throw new Error("No products from this vendor in your cart");
		}

		// =============== calculate total amount for vendor products only ================
		const vendorTotal = vendorItems.reduce(
			(total: number, item: { product: { salePrice?: number; price: number }; quantity: number }) => {
				const price = item.product.salePrice || item.product.price;
				return total + price * item.quantity;
			},
			0
		);

		// =============== check minimum purchase requirement ================
		if (coupon.minPurchase && vendorTotal < coupon.minPurchase) {
			throw new Error(`Minimum purchase amount of ৳${coupon.minPurchase} required for this vendor's products`);
		}

		// =============== calculate discount ================
		let discountAmount = 0;
		if (coupon.type === "percentage") {
			discountAmount = (vendorTotal * coupon.amount) / 100;
			if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
				discountAmount = coupon.maxDiscount;
			}
		} else {
			discountAmount = coupon.amount;
		}

		// =============== ensure discount doesn't exceed vendor total ================
		discountAmount = Math.min(discountAmount, vendorTotal);

		return {
			success: true,
			coupon: convertToPlaintObject(coupon),
			discountAmount: Math.round(discountAmount * 100) / 100,
			vendorTotal: Math.round(vendorTotal * 100) / 100,
			applicableItems: vendorItems.length,
		};
	} catch (error: unknown) {
		if (error instanceof Error) {
			return { success: false, error: error.message };
		}
		return { success: false, error: "An unknown error occurred" };
	}
}

// =============== mark coupon as used ================
export async function markCouponAsUsed(couponId: string, userId: string) {
	try {
		await connectToDatabase();

		const user = await User.findByIdAndUpdate(
			userId,
			{
				$push: {
					usedCoupons: {
						couponId: couponId,
						usedAt: new Date(),
					},
				},
			},
			{ new: true }
		);

		if (!user) {
			throw new Error("User not found");
		}

		return { success: true };
	} catch (error: unknown) {
		if (error instanceof Error) {
			return { success: false, error: error.message };
		}
		return { success: false, error: "An unknown error occurred" };
	}
}
