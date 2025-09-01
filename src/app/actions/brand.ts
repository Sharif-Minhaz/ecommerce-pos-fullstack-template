"use server";

import { Brand } from "@/models/BrandModel";
import { Product } from "@/models/ProductModel";
import { connectToDatabase } from "@/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { CloudinaryService } from "@/lib/cloudinary";
import { revalidatePath } from "next/cache";

// =============== get brands for home (all active) ================
export async function getHomeBrands(limit?: number) {
	try {
		await connectToDatabase();
		let query = Brand.find({ isActive: true }).select("name nameBN slug image").sort({ createdAt: -1 });
		if (typeof limit === "number") {
			query = query.limit(limit);
		}
		const brands = await query;
		return { success: true, brands };
	} catch (error: unknown) {
		if (error instanceof Error) {
			return { success: false, error: error.message };
		}
		return { success: false, error: "An unknown error occurred" };
	}
}

// =============== get brands for product form ================
export async function getBrands() {
	try {
		await connectToDatabase();
		const brands = await Brand.find({ isActive: true }).select("name nameBN slug");
		return { success: true, brands };
	} catch (error: unknown) {
		if (error instanceof Error) {
			return { success: false, error: error.message };
		}
		return { success: false, error: "An unknown error occurred" };
	}
}

// =============== create brand (quick add) ================
export async function createBrandQuick(formData: FormData) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.email) {
			throw new Error("User not authenticated");
		}

		await connectToDatabase();

		const name = (formData.get("name") as string)?.trim();
		const nameBN = (formData.get("nameBN") as string)?.trim();
		const description = (formData.get("description") as string)?.trim();
		const descriptionBN = (formData.get("descriptionBN") as string)?.trim();
		const imageFile = formData.get("image") as File | null;

		if (!name || !nameBN || !description || !descriptionBN || !imageFile) {
			throw new Error("All fields are required");
		}

		if (!CloudinaryService.isConfigured()) {
			throw new Error("Cloudinary is not properly configured");
		}

		const existing = await Brand.findOne({ name });
		if (existing) {
			throw new Error("Brand with this name already exists");
		}

		if (!imageFile || imageFile.size <= 0) {
			throw new Error("Please provide a valid image file");
		}

		const uploadedBrand = await CloudinaryService.uploadImage(imageFile, { folder: "brands" });

		const brand = new Brand({
			name,
			nameBN,
			description,
			descriptionBN,
			image: uploadedBrand.secure_url,
		});
		await brand.save();

		revalidatePath("/");

		return { success: true, brand };
	} catch (error: unknown) {
		if (error instanceof Error) {
			return { success: false, error: error.message };
		}
		return { success: false, error: "An unknown error occurred" };
	}
}

// =============== get vendor's brands ================
export async function getVendorBrands() {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.email) {
			throw new Error("User not authenticated");
		}

		if (session?.user?.userType !== "vendor") {
			throw new Error("Access denied. Vendor account required.");
		}

		await connectToDatabase();

		const brands = await Brand.find({
			createdBy: session.user.id,
		})
			.populate("createdBy", "name email")
			.sort({ createdAt: -1 });

		return { success: true, brands };
	} catch (error: unknown) {
		if (error instanceof Error) {
			return { success: false, error: error.message };
		}
		return { success: false, error: "An unknown error occurred" };
	}
}

// =============== create brand ================
export async function createBrand(formData: FormData) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.email) {
			throw new Error("User not authenticated");
		}

		if (session?.user?.userType !== "vendor") {
			throw new Error("Access denied. Vendor account required.");
		}

		const name = formData.get("name") as string;
		const nameBN = formData.get("nameBN") as string;
		const description = formData.get("description") as string;
		const descriptionBN = formData.get("descriptionBN") as string;
		const imageFile = formData.get("image") as File;

		if (!name || !nameBN || !description || !descriptionBN || !imageFile) {
			throw new Error("All fields are required");
		}

		await connectToDatabase();

		// =============== upload image to cloudinary ================
		const imageResult = await CloudinaryService.uploadFile(imageFile, {
			folder: "brands",
		});

		// =============== create brand ================
		const brand = new Brand({
			name,
			nameBN,
			description,
			descriptionBN,
			image: imageResult.secure_url,
			imageKey: imageResult.public_id,
			createdBy: session.user.id,
		});

		await brand.save();

		revalidatePath("/my-shop");
		revalidatePath("/my-shop/brands");
		return { success: true, brand };
	} catch (error: unknown) {
		if (error instanceof Error) {
			return { success: false, error: error.message };
		}
		return { success: false, error: "An unknown error occurred" };
	}
}

// =============== update brand ================
export async function updateBrand(brandId: string, formData: FormData) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.email) {
			throw new Error("User not authenticated");
		}

		if (session?.user?.userType !== "vendor") {
			throw new Error("Access denied. Vendor account required.");
		}

		await connectToDatabase();

		// =============== find brand and check ownership ================
		const brand = await Brand.findById(brandId);
		if (!brand) {
			throw new Error("Brand not found");
		}

		if (brand.createdBy.toString() !== session.user.id) {
			throw new Error("Access denied. You can only edit your own brands.");
		}

		const name = formData.get("name") as string;
		const nameBN = formData.get("nameBN") as string;
		const description = formData.get("description") as string;
		const descriptionBN = formData.get("descriptionBN") as string;
		const imageFile = formData.get("image") as File;

		if (!name || !nameBN || !description || !descriptionBN) {
			throw new Error("All fields are required");
		}

		// =============== update basic fields ================
		brand.name = name;
		brand.nameBN = nameBN;
		brand.description = description;
		brand.descriptionBN = descriptionBN;

		// =============== handle image update ================
		if (imageFile && imageFile.size > 0) {
			// =============== delete old image if exists ================
			if (brand.imageKey) {
				try {
					await CloudinaryService.deleteFile(brand.imageKey);
				} catch (deleteError) {
					console.warn("Failed to delete old image:", deleteError);
				}
			}

			// =============== upload new image ================
			const imageResult = await CloudinaryService.uploadFile(imageFile, {
				folder: "brands",
			});

			brand.image = imageResult.secure_url;
			brand.imageKey = imageResult.public_id;
		}

		await brand.save();

		revalidatePath("/my-shop");
		revalidatePath("/my-shop/brands");
		return { success: true, brand };
	} catch (error: unknown) {
		if (error instanceof Error) {
			return { success: false, error: error.message };
		}
		return { success: false, error: "An unknown error occurred" };
	}
}

// =============== delete brand ================
export async function deleteBrand(brandId: string) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.email) {
			throw new Error("User not authenticated");
		}

		if (session?.user?.userType !== "vendor") {
			throw new Error("Access denied. Vendor account required.");
		}

		await connectToDatabase();

		// =============== find brand and check ownership ================
		const brand = await Brand.findById(brandId);
		if (!brand) {
			throw new Error("Brand not found");
		}

		if (brand.createdBy.toString() !== session.user.id) {
			throw new Error("Access denied. You can only delete your own brands.");
		}

		// =============== check if brand is used in products ================
		const productCount = await Product.countDocuments({ brand: brandId });
		if (productCount > 0) {
			throw new Error("Cannot delete brand. It is used in products.");
		}

		// =============== delete image from cloudinary ================
		if (brand.imageKey) {
			try {
				await CloudinaryService.deleteFile(brand.imageKey);
			} catch (deleteError) {
				console.warn("Failed to delete image:", deleteError);
			}
		}

		await Brand.findByIdAndDelete(brandId);

		revalidatePath("/my-shop");
		revalidatePath("/my-shop/brands");
		return { success: true };
	} catch (error: unknown) {
		if (error instanceof Error) {
			return { success: false, error: error.message };
		}
		return { success: false, error: "An unknown error occurred" };
	}
}

// =============== get single brand ================
export async function getBrandById(brandId: string) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.email) {
			throw new Error("User not authenticated");
		}

		if (session?.user?.userType !== "vendor") {
			throw new Error("Access denied. Vendor account required.");
		}

		await connectToDatabase();

		const brand = await Brand.findById(brandId);
		if (!brand) {
			throw new Error("Brand not found");
		}

		if (brand.createdBy.toString() !== session.user.id) {
			throw new Error("Access denied. You can only view your own brands.");
		}

		return { success: true, brand };
	} catch (error: unknown) {
		if (error instanceof Error) {
			return { success: false, error: error.message };
		}
		return { success: false, error: "An unknown error occurred" };
	}
}
