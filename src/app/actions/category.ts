"use server";

import { Category } from "@/models/CategoryModel";
import { Product } from "@/models/ProductModel";
import { connectToDatabase } from "@/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { CloudinaryService } from "@/lib/cloudinary";
import { revalidatePath } from "next/cache";

// =============== get categories for home (limited) ================
export async function getHomeCategories(limit: number = 8) {
	try {
		await connectToDatabase();
		const categories = await Category.find({ isActive: true })
			.select("name nameBN slug image")
			.sort({ createdAt: -1 })
			.limit(limit);
		return { success: true, categories };
	} catch (error: unknown) {
		if (error instanceof Error) {
			return { success: false, error: error.message };
		}
		return { success: false, error: "An unknown error occurred" };
	}
}

// =============== get categories for product form ================
export async function getCategories() {
	try {
		await connectToDatabase();
		const categories = await Category.find({ isActive: true }).select("name nameBN slug");
		return { success: true, categories };
	} catch (error: unknown) {
		if (error instanceof Error) {
			return { success: false, error: error.message };
		}
		return { success: false, error: "An unknown error occurred" };
	}
}

// =============== create category (quick add) ================
export async function createCategoryQuick(formData: FormData) {
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

		const existing = await Category.findOne({ name });
		if (existing) {
			throw new Error("Category with this name already exists");
		}

		if (!imageFile || imageFile.size <= 0) {
			throw new Error("Please provide a valid image file");
		}

		const uploaded = await CloudinaryService.uploadImage(imageFile, {
			folder: "categories",
		});

		const category = new Category({
			name,
			nameBN,
			description,
			descriptionBN,
			image: uploaded.secure_url,
		});
		await category.save();

		revalidatePath("/");

		return { success: true, category };
	} catch (error: unknown) {
		if (error instanceof Error) {
			return { success: false, error: error.message };
		}
		return { success: false, error: "An unknown error occurred" };
	}
}

// =============== get vendor's categories ================
export async function getVendorCategories() {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.email) {
			throw new Error("User not authenticated");
		}

		if (session?.user?.userType !== "vendor") {
			throw new Error("Access denied. Vendor account required.");
		}

		await connectToDatabase();

		const categories = await Category.find({
			createdBy: session.user.id,
		})
			.populate("parent", "name nameBN")
			.populate("createdBy", "name email")
			.sort({ createdAt: -1 });

		return { success: true, categories };
	} catch (error: unknown) {
		if (error instanceof Error) {
			return { success: false, error: error.message };
		}
		return { success: false, error: "An unknown error occurred" };
	}
}

// =============== create category ================
export async function createCategory(formData: FormData) {
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
		const parent = formData.get("parent") as string;
		const imageFile = formData.get("image") as File;

		if (!name || !nameBN || !description || !descriptionBN || !imageFile) {
			throw new Error("All fields are required");
		}

		await connectToDatabase();

		// =============== validate parent category ownership if provided ================
		if (parent && parent !== "") {
			const parentCategory = await Category.findById(parent);
			if (!parentCategory) {
				throw new Error("Parent category not found");
			}
			if (parentCategory.createdBy.toString() !== session.user.id) {
				throw new Error("You can only use your own categories as parent.");
			}
		}

		// =============== upload image to cloudinary ================
		const imageResult = await CloudinaryService.uploadFile(imageFile, {
			folder: "categories",
		});

		// =============== create category ================
		const category = new Category({
			name,
			nameBN,
			description,
			descriptionBN,
			parent: parent && parent !== "" ? parent : null,
			image: imageResult.secure_url,
			imageKey: imageResult.public_id,
			createdBy: session.user.id,
		});

		await category.save();

		// =============== update parent category children array ================
		if (parent && parent !== "") {
			await Category.findByIdAndUpdate(parent, {
				$addToSet: { children: category._id },
			});
		}

		revalidatePath("/my-shop");
		revalidatePath("/my-shop/categories");
		return { success: true, category };
	} catch (error: unknown) {
		if (error instanceof Error) {
			return { success: false, error: error.message };
		}
		return { success: false, error: "An unknown error occurred" };
	}
}

// =============== update category ================
export async function updateCategory(categoryId: string, formData: FormData) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.email) {
			throw new Error("User not authenticated");
		}

		if (session?.user?.userType !== "vendor") {
			throw new Error("Access denied. Vendor account required.");
		}

		await connectToDatabase();

		// =============== find category and check ownership ================
		const category = await Category.findById(categoryId);
		if (!category) {
			throw new Error("Category not found");
		}

		if (category.createdBy.toString() !== session.user.id) {
			throw new Error("Access denied. You can only edit your own categories.");
		}

		const name = formData.get("name") as string;
		const nameBN = formData.get("nameBN") as string;
		const description = formData.get("description") as string;
		const descriptionBN = formData.get("descriptionBN") as string;
		const parent = formData.get("parent") as string;
		const imageFile = formData.get("image") as File;

		if (!name || !nameBN || !description || !descriptionBN) {
			throw new Error("All fields are required");
		}

		// =============== validate parent category ownership if provided ================
		if (parent && parent !== "" && parent !== category.parent?.toString()) {
			const parentCategory = await Category.findById(parent);
			if (!parentCategory) {
				throw new Error("Parent category not found");
			}
			if (parentCategory.createdBy.toString() !== session.user.id) {
				throw new Error("You can only use your own categories as parent.");
			}

			// =============== prevent circular reference ================
			if (parent === categoryId) {
				throw new Error("Category cannot be its own parent");
			}
		}

		const oldParent = category.parent;

		// =============== update basic fields ================
		category.name = name;
		category.nameBN = nameBN;
		category.description = description;
		category.descriptionBN = descriptionBN;
		category.parent = parent && parent !== "" ? parent : null;

		// =============== handle image update ================
		if (imageFile && imageFile.size > 0) {
			// =============== delete old image if exists ================
			if (category.imageKey) {
				try {
					await CloudinaryService.deleteFile(category.imageKey);
				} catch (deleteError) {
					console.warn("Failed to delete old image:", deleteError);
				}
			}

			// =============== upload new image ================
			const imageResult = await CloudinaryService.uploadFile(imageFile, {
				folder: "categories",
			});

			category.image = imageResult.secure_url;
			category.imageKey = imageResult.public_id;
		}

		await category.save();

		// =============== update parent-child relationships ================
		if (oldParent && oldParent.toString() !== (parent || "")) {
			// =============== remove from old parent ================
			await Category.findByIdAndUpdate(oldParent, {
				$pull: { children: categoryId },
			});
		}

		if (parent && parent !== "" && parent !== oldParent?.toString()) {
			// =============== add to new parent ================
			await Category.findByIdAndUpdate(parent, {
				$addToSet: { children: categoryId },
			});
		}

		revalidatePath("/my-shop");
		revalidatePath("/my-shop/categories");
		return { success: true, category };
	} catch (error: unknown) {
		if (error instanceof Error) {
			return { success: false, error: error.message };
		}
		return { success: false, error: "An unknown error occurred" };
	}
}

// =============== delete category ================
export async function deleteCategory(categoryId: string) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.email) {
			throw new Error("User not authenticated");
		}

		if (session?.user?.userType !== "vendor") {
			throw new Error("Access denied. Vendor account required.");
		}

		await connectToDatabase();

		// =============== find category and check ownership ================
		const category = await Category.findById(categoryId);
		if (!category) {
			throw new Error("Category not found");
		}

		if (category.createdBy.toString() !== session.user.id) {
			throw new Error("Access denied. You can only delete your own categories.");
		}

		// =============== check if category has children ================
		const childrenCount = await Category.countDocuments({ parent: categoryId });
		if (childrenCount > 0) {
			throw new Error("Cannot delete category. It has subcategories.");
		}

		// =============== check if category is used in products ================
		const productCount = await Product.countDocuments({ category: categoryId });
		if (productCount > 0) {
			throw new Error("Cannot delete category. It is used in products.");
		}

		// =============== remove from parent's children array ================
		if (category.parent) {
			await Category.findByIdAndUpdate(category.parent, {
				$pull: { children: categoryId },
			});
		}

		// =============== delete image from cloudinary ================
		if (category.imageKey) {
			try {
				await CloudinaryService.deleteFile(category.imageKey);
			} catch (deleteError) {
				console.warn("Failed to delete image:", deleteError);
			}
		}

		await Category.findByIdAndDelete(categoryId);

		revalidatePath("/my-shop");
		revalidatePath("/my-shop/categories");
		return { success: true };
	} catch (error: unknown) {
		if (error instanceof Error) {
			return { success: false, error: error.message };
		}
		return { success: false, error: "An unknown error occurred" };
	}
}

// =============== get single category ================
export async function getCategoryById(categoryId: string) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.email) {
			throw new Error("User not authenticated");
		}

		if (session?.user?.userType !== "vendor") {
			throw new Error("Access denied. Vendor account required.");
		}

		await connectToDatabase();

		const category = await Category.findById(categoryId)
			.populate("parent", "name nameBN")
			.populate("children", "name nameBN");

		if (!category) {
			throw new Error("Category not found");
		}

		if (category.createdBy.toString() !== session.user.id) {
			throw new Error("Access denied. You can only view your own categories.");
		}

		return { success: true, category };
	} catch (error: unknown) {
		if (error instanceof Error) {
			return { success: false, error: error.message };
		}
		return { success: false, error: "An unknown error occurred" };
	}
}
