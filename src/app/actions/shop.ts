"use server";

import { User } from "@/models/UserModel";
import { connectToDatabase } from "@/db";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { uploadShopImage, CloudinaryService } from "@/lib/cloudinary";
import { convertToPlaintObject } from "@/lib/utils";

export async function getVendorShop() {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.email) {
			throw new Error("User not authenticated");
		}

		// Get user from database to check userType
		await connectToDatabase();
		const user = await User.findOne({ email: session.user.email }).select("-password");

		if (!user) {
			throw new Error("User not found");
		}

		if (session?.user?.userType !== "vendor") {
			throw new Error("Access denied. Vendor account required.");
		}

		// Check if vendor has shop information, if not create default
		if (!user.shopName || !user.shopDescription || !user.registrationNumber) {
			// Create default shop information
			const defaultShopData = {
				shopName: user.shopName || "My Shop",
				shopDescription: user.shopDescription || "Welcome to my shop!",
				registrationNumber: user.registrationNumber || "REG-" + Date.now(),
			};

			const updatedUser = await User.findOneAndUpdate({ email: session.user.email }, defaultShopData, {
				new: true,
				runValidators: true,
			}).select("-password");

			if (updatedUser) {
				user.shopName = updatedUser.shopName;
				user.shopDescription = updatedUser.shopDescription;
				user.registrationNumber = updatedUser.registrationNumber;
			}
		}

		// Extract shop information
		const shop = {
			_id: user._id,
			shopName: user.shopName,
			shopDescription: user.shopDescription,
			shopImages: user.shopImages || [],
			registrationNumber: user.registrationNumber,
			image: user.image,
			updatedAt: user.updatedAt,
		};

		return { success: true, shop: convertToPlaintObject(shop) };
	} catch (error: unknown) {
		if (error instanceof Error) {
			return { success: false, error: error.message };
		}
		return { success: false, error: "An unknown error occurred" };
	}
}

export async function updateVendorShop(formData: FormData, isImageUpload: boolean = false, imageToRemove?: string) {
	try {
		await connectToDatabase();
		const session = await getServerSession(authOptions);

		if (!session?.user?.email) {
			throw new Error("User not authenticated");
		}

		// Check if Cloudinary is configured
		if (!CloudinaryService.isConfigured()) {
			throw new Error("Cloudinary is not properly configured");
		}

		if (session?.user?.userType !== "vendor") {
			throw new Error(`Access denied. Vendor account required. Current user type: ${session?.user?.userType}`);
		}

		if (isImageUpload) {
			// Handle image upload using the Cloudinary service
			const imageFile = formData.get("image") as File;
			if (!imageFile) {
				throw new Error("No image file provided");
			}

			try {
				// Upload image using the dedicated shop image upload function
				const uploadResult = await uploadShopImage(imageFile);

				// Add image to user's shopImages array
				const updatedUser = await User.findOneAndUpdate(
					{ email: session.user.email },
					{ $push: { shopImages: uploadResult.secure_url } },
					{ new: true, runValidators: true }
				).select("-password");

				if (!updatedUser) {
					throw new Error("Failed to update user");
				}

				revalidatePath("/my-shop");
				return { success: true, shop: updatedUser };
			} catch (uploadError) {
				throw new Error(
					`Image upload failed: ${uploadError instanceof Error ? uploadError.message : "Unknown error"}`
				);
			}
		}

		if (imageToRemove) {
			// Handle image removal
			const updatedUser = await User.findOneAndUpdate(
				{ email: session.user.email },
				{ $pull: { shopImages: imageToRemove } },
				{ new: true, runValidators: true }
			).select("-password");

			if (!updatedUser) {
				throw new Error("Failed to update user");
			}

			revalidatePath("/my-shop");
			return { success: true, shop: convertToPlaintObject(updatedUser) };
		}

		// Handle regular shop information update
		const shopName = formData.get("shopName") as string;
		const shopDescription = formData.get("shopDescription") as string;
		const registrationNumber = formData.get("registrationNumber") as string;

		// Application-level validation
		if (!shopName || shopName.trim().length < 2) {
			throw new Error("Shop name must be at least 2 characters long");
		}
		if (!shopDescription || shopDescription.trim().length < 10) {
			throw new Error("Shop description must be at least 10 characters long");
		}
		if (!registrationNumber || registrationNumber.trim().length === 0) {
			throw new Error("Registration number is required");
		}

		const updateData: Partial<{
			shopName: string;
			shopDescription: string;
			registrationNumber: string;
		}> = {
			shopName: shopName.trim(),
			shopDescription: shopDescription.trim(),
			registrationNumber: registrationNumber.trim(),
		};

		const updatedUser = await User.findOneAndUpdate({ email: session.user.email }, updateData, {
			new: true,
			runValidators: true,
		}).select("-password");

		if (!updatedUser) {
			throw new Error("Failed to update user");
		}

		revalidatePath("/my-shop");
		return { success: true, shop: convertToPlaintObject(updatedUser) };
	} catch (error: unknown) {
		if (error instanceof Error) {
			return { success: false, error: error.message };
		}
		return { success: false, error: "An unknown error occurred" };
	}
}

export async function getAllVendorShops() {
	try {
		await connectToDatabase();

		// Find all users with userType "vendor" and select only the fields needed for shop display
		const vendorUsers = await User.find({
			userType: "vendor",
			is_ban: false, // Only show non-banned vendors
		}).select(
			"name email phoneNumber shopName shopDescription shopImages registrationNumber image createdAt updatedAt wishlist"
		);

		// Transform the data to match the expected shop interface
		const shops = vendorUsers.map((user) => ({
			_id: user._id.toString(),
			name: user.name,
			email: user.email,
			phoneNumber: user.phoneNumber,
			is_ban: user.is_ban,
			userType: user.userType,
			shopName: user.shopName,
			shopDescription: user.shopDescription,
			shopImages: user.shopImages || [],
			registrationNumber: user.registrationNumber,
			image: user.image,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
			wishlist: user.wishlist || [],
		}));

		return { success: true, shops: convertToPlaintObject(shops) };
	} catch (error: unknown) {
		if (error instanceof Error) {
			return { success: false, error: error.message };
		}
		return { success: false, error: "An unknown error occurred" };
	}
}

// =============== get shop by registration number ================
export async function getShopByRegistrationNumber(registrationNumber: string) {
	try {
		await connectToDatabase();

		// Find user with userType "vendor" and matching registration number
		const vendorUser = await User.findOne({
			userType: "vendor",
			registrationNumber: registrationNumber,
			is_ban: false, // Only show non-banned vendors
		}).select(
			"name email phoneNumber shopName shopDescription shopImages registrationNumber image createdAt updatedAt wishlist"
		);

		if (!vendorUser) {
			return { success: false, error: "Shop not found" };
		}

		// Transform the data to match the expected shop interface
		const shop = {
			_id: vendorUser._id.toString(),
			name: vendorUser.name,
			email: vendorUser.email,
			phoneNumber: vendorUser.phoneNumber,
			is_ban: vendorUser.is_ban,
			userType: vendorUser.userType,
			shopName: vendorUser.shopName,
			shopDescription: vendorUser.shopDescription,
			shopImages: vendorUser.shopImages || [],
			registrationNumber: vendorUser.registrationNumber,
			image: vendorUser.image,
			createdAt: vendorUser.createdAt,
			updatedAt: vendorUser.updatedAt,
			wishlist: vendorUser.wishlist || [],
		};

		return { success: true, shop: convertToPlaintObject(shop) };
	} catch (error: unknown) {
		if (error instanceof Error) {
			return { success: false, error: error.message };
		}
		return { success: false, error: "An unknown error occurred" };
	}
}
