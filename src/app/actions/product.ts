"use server";

import { Product } from "@/models/ProductModel";
import { Category } from "@/models/CategoryModel";
import { Brand } from "@/models/BrandModel";
import { connectToDatabase } from "@/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { uploadProductImage, CloudinaryService } from "@/lib/cloudinary";
import { revalidatePath } from "next/cache";
import { convertToPlaintObject } from "@/lib/utils";

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

// =============== get vendor's own products ================
export async function getVendorProducts() {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.email) {
			throw new Error("User not authenticated");
		}

		if (session?.user?.userType !== "vendor") {
			throw new Error("Access denied. Vendor account required.");
		}

		await connectToDatabase();

		console.log("I am here dude");

		const products = await Product.find({
			vendor: session.user.id,
		})
			.populate("category", "name nameBN slug")
			.populate("brand", "name nameBN slug")
			.sort({ createdAt: -1 });

		return { success: true, products: convertToPlaintObject(products) };
	} catch (error: unknown) {
		if (error instanceof Error) {
			return { success: false, error: error.message };
		}
		return { success: false, error: "An unknown error occurred" };
	}
}

// =============== get single product by id ================
export async function getProductById(productId: string) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.email) {
			throw new Error("User not authenticated");
		}

		if (session?.user?.userType !== "vendor") {
			throw new Error("Access denied. Vendor account required.");
		}

		await connectToDatabase();

		const product = await Product.findOne({
			_id: productId,
			vendor: session.user.id,
		})
			.populate("category", "name nameBN slug")
			.populate("brand", "name nameBN slug");

		if (!product) {
			return { success: false, error: "Product not found" };
		}

		return { success: true, product };
	} catch (error: unknown) {
		if (error instanceof Error) {
			return { success: false, error: error.message };
		}
		return { success: false, error: "An unknown error occurred" };
	}
}

// =============== create new product ================
export async function createProduct(formData: FormData) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.email) {
			throw new Error("User not authenticated");
		}

		if (session?.user?.userType !== "vendor") {
			throw new Error("Access denied. Vendor account required.");
		}

		await connectToDatabase();

		// Check if Cloudinary is configured
		if (!CloudinaryService.isConfigured()) {
			throw new Error("Cloudinary is not properly configured");
		}

		// Extract form data
		const title = formData.get("title") as string;
		const titleBN = formData.get("titleBN") as string;
		const description = formData.get("description") as string;
		const descriptionBN = formData.get("descriptionBN") as string;
		const unit = formData.get("unit") as string;
		const stock = parseInt(formData.get("stock") as string);
		const price = parseFloat(formData.get("price") as string);
		const salePrice = formData.get("salePrice") ? parseFloat(formData.get("salePrice") as string) : undefined;
		const highlights = formData.get("highlights") as string;
		const highlightsBN = formData.get("highlightsBN") as string;
		const specification = formData.get("specification") as string;
		const specificationBN = formData.get("specificationBN") as string;
		const categoryId = formData.get("category") as string;
		const brandId = formData.get("brand") as string;
		const sku = formData.get("sku") as string;
		const barcode = formData.get("barcode") as string;
		const weight = formData.get("weight") ? parseFloat(formData.get("weight") as string) : undefined;
		const warranty = formData.get("warranty") as string;
		const warrantyBN = formData.get("warrantyBN") as string;
		const tags =
			(formData.get("tags") as string)
				?.split(",")
				.map((tag) => tag.trim())
				.filter(Boolean) || [];

		// Validate required fields
		if (
			!title ||
			!titleBN ||
			!description ||
			!descriptionBN ||
			!unit ||
			!stock ||
			!price ||
			!highlights ||
			!highlightsBN ||
			!specification ||
			!specificationBN ||
			!categoryId ||
			!brandId ||
			!sku
		) {
			throw new Error("All required fields must be filled");
		}

		// Validate category and brand exist
		const category = await Category.findById(categoryId);
		const brand = await Brand.findById(brandId);

		if (!category) {
			throw new Error("Selected category does not exist");
		}

		if (!brand) {
			throw new Error("Selected brand does not exist");
		}

		// Check if SKU already exists
		const existingSku = await Product.findOne({ sku });
		if (existingSku) {
			throw new Error("SKU already exists. Please choose a different one.");
		}

		// Check if barcode already exists (if provided)
		if (barcode) {
			const existingBarcode = await Product.findOne({ barcode });
			if (existingBarcode) {
				throw new Error("Barcode already exists. Please choose a different one.");
			}
		}

		// Calculate discount rate if sale price is provided
		let discountRate: number | undefined;
		if (salePrice && salePrice < price) {
			discountRate = Math.round(((price - salePrice) / price) * 100);
		}

		// Create product object
		const productData = {
			title,
			titleBN,
			description,
			descriptionBN,
			unit,
			stock,
			price,
			salePrice,
			discountRate,
			highlights,
			highlightsBN,
			specification,
			specificationBN,
			category: categoryId,
			brand: brandId,
			vendor: session.user.id,
			sku,
			barcode,
			weight,
			warranty,
			warrantyBN,
			tags,
			gallery: [], // Will be populated after image upload
		};

		// Create product
		const productResponse = new Product(productData);
		await productResponse.save();

		// Handle image uploads
		const imageFiles = formData.getAll("images") as File[];
		const uploadedImages: string[] = [];

		for (const file of imageFiles) {
			if (file.size > 0) {
				try {
					const uploadResult = await uploadProductImage(file);
					uploadedImages.push(uploadResult.secure_url);
				} catch (error) {
					console.error("Failed to upload image:", error);
				}
			}
		}

		// Update product with uploaded images
		if (uploadedImages.length > 0) {
			productResponse.gallery = uploadedImages;
			await productResponse.save();
		}

		revalidatePath("/my-shop");
		revalidatePath("/products");

		const result = convertToPlaintObject(productResponse);

		return { success: true, product: result };
	} catch (error: unknown) {
		if (error instanceof Error) {
			return { success: false, error: error.message };
		}
		return { success: false, error: "An unknown error occurred" };
	}
}

// =============== update product ================
export async function updateProduct(productId: string, formData: FormData) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.email) {
			throw new Error("User not authenticated");
		}

		if (session?.user?.userType !== "vendor") {
			throw new Error("Access denied. Vendor account required.");
		}

		await connectToDatabase();

		// Check if product exists and belongs to the vendor
		const existingProduct = await Product.findOne({
			_id: productId,
			vendor: session.user.id,
		});

		if (!existingProduct) {
			throw new Error("Product not found or access denied");
		}

		// Extract form data
		const title = formData.get("title") as string;
		const titleBN = formData.get("titleBN") as string;
		const description = formData.get("description") as string;
		const descriptionBN = formData.get("descriptionBN") as string;
		const unit = formData.get("unit") as string;
		const stock = parseInt(formData.get("stock") as string);
		const price = parseFloat(formData.get("price") as string);
		const salePrice = formData.get("salePrice") ? parseFloat(formData.get("salePrice") as string) : undefined;
		const highlights = formData.get("highlights") as string;
		const highlightsBN = formData.get("highlightsBN") as string;
		const specification = formData.get("specification") as string;
		const specificationBN = formData.get("specificationBN") as string;
		const categoryId = formData.get("category") as string;
		const brandId = formData.get("brand") as string;
		const sku = formData.get("sku") as string;
		const barcode = formData.get("barcode") as string;
		const weight = formData.get("weight") ? parseFloat(formData.get("weight") as string) : undefined;
		const warranty = formData.get("warranty") as string;
		const warrantyBN = formData.get("warrantyBN") as string;
		const tags =
			(formData.get("tags") as string)
				?.split(",")
				.map((tag) => tag.trim())
				.filter(Boolean) || [];
		const isActive = formData.get("isActive") === "true";
		const isFeatured = formData.get("isFeatured") === "true";

		// Validate required fields
		if (
			!title ||
			!titleBN ||
			!description ||
			!descriptionBN ||
			!unit ||
			!stock ||
			!price ||
			!highlights ||
			!highlightsBN ||
			!specification ||
			!specificationBN ||
			!categoryId ||
			!brandId ||
			!sku
		) {
			throw new Error("All required fields must be filled");
		}

		// Check if SKU already exists (excluding current product)
		const existingSku = await Product.findOne({ sku, _id: { $ne: productId } });
		if (existingSku) {
			throw new Error("SKU already exists. Please choose a different one.");
		}

		// Check if barcode already exists (excluding current product)
		if (barcode) {
			const existingBarcode = await Product.findOne({ barcode, _id: { $ne: productId } });
			if (existingBarcode) {
				throw new Error("Barcode already exists. Please choose a different one.");
			}
		}

		// Calculate discount rate if sale price is provided
		let discountRate: number | undefined;
		if (salePrice && salePrice < price) {
			discountRate = Math.round(((price - salePrice) / price) * 100);
		}

		// Update product
		const updatedProductResponse = await Product.findByIdAndUpdate(
			productId,
			{
				title,
				titleBN,
				description,
				descriptionBN,
				unit,
				stock,
				price,
				salePrice,
				discountRate,
				highlights,
				highlightsBN,
				specification,
				specificationBN,
				category: categoryId,
				brand: brandId,
				sku,
				barcode,
				weight,
				warranty,
				warrantyBN,
				tags,
				isActive,
				isFeatured,
			},
			{ new: true, runValidators: true }
		)
			.populate("category", "name nameBN slug")
			.populate("brand", "name nameBN slug");

		const result = convertToPlaintObject(updatedProductResponse);

		revalidatePath("/my-shop");
		revalidatePath("/products");

		return { success: true, product: result };
	} catch (error: unknown) {
		if (error instanceof Error) {
			return { success: false, error: error.message };
		}
		return { success: false, error: "An unknown error occurred" };
	}
}

// =============== delete product ================
export async function deleteProduct(productId: string) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.email) {
			throw new Error("User not authenticated");
		}

		if (session?.user?.userType !== "vendor") {
			throw new Error("Access denied. Vendor account required.");
		}

		await connectToDatabase();

		// Check if product exists and belongs to the vendor
		const product = await Product.findOne({
			_id: productId,
			vendor: session.user.id,
		});

		if (!product) {
			throw new Error("Product not found or access denied");
		}

		// Soft delete by setting isActive to false
		await Product.findByIdAndUpdate(productId, { isActive: false });

		revalidatePath("/my-shop");
		revalidatePath("/products");

		return { success: true, message: "Product deleted successfully" };
	} catch (error: unknown) {
		if (error instanceof Error) {
			return { success: false, error: error.message };
		}
		return { success: false, error: "An unknown error occurred" };
	}
}

// =============== upload product images ================
export async function uploadProductImages(productId: string, formData: FormData) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.email) {
			throw new Error("User not authenticated");
		}

		if (session?.user?.userType !== "vendor") {
			throw new Error("Access denied. Vendor account required.");
		}

		await connectToDatabase();

		// Check if Cloudinary is configured
		if (!CloudinaryService.isConfigured()) {
			throw new Error("Cloudinary is not properly configured");
		}

		// Check if product exists and belongs to the vendor
		const product = await Product.findOne({
			_id: productId,
			vendor: session.user.id,
		});

		if (!product) {
			throw new Error("Product not found or access denied");
		}

		// Handle image uploads
		const imageFiles = formData.getAll("images") as File[];
		const uploadedImages: string[] = [];

		for (const file of imageFiles) {
			if (file.size > 0) {
				try {
					const uploadResult = await uploadProductImage(file);
					uploadedImages.push(uploadResult.secure_url);
				} catch (error) {
					console.error("Failed to upload image:", error);
				}
			}
		}

		// Update product with new images
		if (uploadedImages.length > 0) {
			product.gallery = [...product.gallery, ...uploadedImages];
			await product.save();
		}

		revalidatePath("/my-shop");
		revalidatePath("/products");

		return { success: true, product };
	} catch (error: unknown) {
		if (error instanceof Error) {
			return { success: false, error: error.message };
		}
		return { success: false, error: "An unknown error occurred" };
	}
}

// =============== remove product image ================
export async function removeProductImage(productId: string, imageUrl: string) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.email) {
			throw new Error("User not authenticated");
		}

		if (session?.user?.userType !== "vendor") {
			throw new Error("Access denied. Vendor account required.");
		}

		await connectToDatabase();

		// Check if product exists and belongs to the vendor
		const product = await Product.findOne({
			_id: productId,
			vendor: session.user.id,
		});

		if (!product) {
			throw new Error("Product not found or access denied");
		}

		// Remove image from gallery
		product.gallery = product.gallery.filter((img: string) => img !== imageUrl);
		await product.save();

		revalidatePath("/my-shop");
		revalidatePath("/products");

		return { success: true, product };
	} catch (error: unknown) {
		if (error instanceof Error) {
			return { success: false, error: error.message };
		}
		return { success: false, error: "An unknown error occurred" };
	}
}
