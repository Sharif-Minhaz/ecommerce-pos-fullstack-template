import { v2 as cloudinary } from "cloudinary";

// =============== configure cloudinary ================
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

const DEFAULT_FOLDER = process.env.CLOUDINARY_UPLOAD_FOLDER;

export interface CloudinaryUploadResult {
	secure_url: string;
	public_id: string;
	width: number;
	height: number;
	format: string;
	resource_type: string;
	bytes: number;
}

export interface CloudinaryUploadOptions {
	folder?: string;
	resource_type?: "image" | "video" | "raw" | "auto";
}

export class CloudinaryService {
	/**
	 * Upload a file to Cloudinary
	 * @param file - The file to upload
	 * @param options - Upload options
	 * @returns Promise with upload result
	 */
	static async uploadFile(file: File, options: CloudinaryUploadOptions = {}): Promise<CloudinaryUploadResult> {
		try {
			// Convert file to buffer
			const bytes = await file.arrayBuffer();
			const buffer = Buffer.from(bytes);

			// Set default options - simplified without problematic parameters
			const uploadOptions = {
				folder: options.folder || DEFAULT_FOLDER || "uploads",
				resource_type: options.resource_type || "auto",
			};

			// Upload to Cloudinary
			const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
				cloudinary.uploader
					.upload_stream(uploadOptions, (error, result) => {
						if (error) {
							console.error(error);
							reject(new Error(`Cloudinary upload failed: ${error.message}`));
						} else if (result) {
							resolve({
								secure_url: result.secure_url,
								public_id: result.public_id,
								width: result.width,
								height: result.height,
								format: result.format,
								resource_type: result.resource_type,
								bytes: result.bytes,
							});
						} else {
							reject(new Error("Cloudinary upload failed: No result returned"));
						}
					})
					.end(buffer);
			});

			return result;
		} catch (error) {
			throw new Error(`File upload failed: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Upload an image to Cloudinary
	 * @param file - The image file to upload
	 * @param options - Upload options
	 * @returns Promise with upload result
	 */
	static async uploadImage(
		file: File,
		options: Omit<CloudinaryUploadOptions, "resource_type"> = {}
	): Promise<CloudinaryUploadResult> {
		return this.uploadFile(file, {
			...options,
			resource_type: "image",
		});
	}

	/**
	 * Check if Cloudinary is properly configured
	 * @returns Boolean indicating if configuration is valid
	 */
	static isConfigured(): boolean {
		return !!(
			process.env.CLOUDINARY_CLOUD_NAME &&
			process.env.CLOUDINARY_API_KEY &&
			process.env.CLOUDINARY_API_SECRET
		);
	}

	/**
	 * Get Cloudinary configuration status
	 * @returns Object with configuration status
	 */
	static getConfigStatus() {
		return {
			isConfigured: this.isConfigured(),
			hasCloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
			hasApiKey: !!process.env.CLOUDINARY_API_KEY,
			hasApiSecret: !!process.env.CLOUDINARY_API_SECRET,
			uploadFolder: process.env.CLOUDINARY_UPLOAD_FOLDER || "uploads",
		};
	}
}

// =============== utility functions for common use cases ================

/**
 * Upload a shop image
 * @param file - The image file
 * @param shopId - The shop ID for folder organization
 * @returns Promise with upload result
 */
export async function uploadShopImage(file: File, shopId?: string): Promise<CloudinaryUploadResult> {
	const folder = shopId ? `${DEFAULT_FOLDER}/shops/${shopId}` : `${DEFAULT_FOLDER}/shops`;

	return CloudinaryService.uploadImage(file, {
		folder,
	});
}

/**
 * Upload a product image
 * @param file - The image file
 * @param productId - The product ID for folder organization
 * @returns Promise with upload result
 */
export async function uploadProductImage(file: File, productId?: string): Promise<CloudinaryUploadResult> {
	const folder = productId ? `${DEFAULT_FOLDER}/products/${productId}` : `${DEFAULT_FOLDER}/products`;

	return CloudinaryService.uploadImage(file, {
		folder,
	});
}

/**
 * Upload a user profile image
 * @param file - The image file
 * @param userId - The user ID for folder organization
 * @returns Promise with upload result
 */
export async function uploadProfileImage(file: File, userId?: string): Promise<CloudinaryUploadResult> {
	const folder = userId ? `${DEFAULT_FOLDER}/profiles/${userId}` : `${DEFAULT_FOLDER}/profiles`;

	return CloudinaryService.uploadImage(file, {
		folder,
	});
}

// =============== export the service class as default ================
export default CloudinaryService;
