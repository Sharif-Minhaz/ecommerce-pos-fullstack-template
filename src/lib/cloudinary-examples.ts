// =============== example usage patterns for cloudinary service ================

import CloudinaryService, { uploadProductImage, uploadProfileImage } from "./cloudinary";

// Example 1: Basic file upload
export async function uploadAnyFile(file: File) {
	try {
		const result = await CloudinaryService.uploadFile(file, {
			folder: "misc",
		});

		console.log("Upload successful:", result.secure_url);
		return result;
	} catch (error) {
		console.error("Upload failed:", error);
		throw error;
	}
}

// Example 2: Product image upload
export async function uploadProductImageExample(file: File, productId: string) {
	try {
		const result = await uploadProductImage(file, productId);

		console.log("Product image uploaded:", result.secure_url);
		return result;
	} catch (error) {
		console.error("Product image upload failed:", error);
		throw error;
	}
}

// Example 3: Profile image upload
export async function uploadUserProfileImage(file: File, userId: string) {
	try {
		const result = await uploadProfileImage(file, userId);

		console.log("Profile image uploaded:", result.secure_url);
		return result;
	} catch (error) {
		console.error("Profile image upload failed:", error);
		throw error;
	}
}

// Example 4: Video upload
export async function uploadVideo(file: File, folder: string = "videos") {
	try {
		const result = await CloudinaryService.uploadFile(file, {
			folder,
			resource_type: "video",
		});

		return result;
	} catch (error) {
		console.error("Video upload failed:", error);
		throw error;
	}
}

// Example 5: Check configuration status
export function checkCloudinaryStatus() {
	const status = CloudinaryService.getConfigStatus();

	if (!status.isConfigured) {
		console.warn("Cloudinary is not properly configured!");
		console.log("Missing:", {
			cloudName: !status.hasCloudName,
			apiKey: !status.hasApiKey,
			apiSecret: !status.hasApiSecret,
		});
	} else {
		console.log("Cloudinary is properly configured");
		console.log("Upload folder:", status.uploadFolder);
	}

	return status;
}

// Example 6: Batch upload multiple files
export async function uploadMultipleFiles(files: File[], folder: string = "batch") {
	const uploadPromises = files.map((file) =>
		CloudinaryService.uploadFile(file, {
			folder: `${folder}/${Date.now()}`,
		})
	);

	try {
		const results = await Promise.all(uploadPromises);
		console.log(`Successfully uploaded ${results.length} files`);
		return results;
	} catch (error) {
		console.error("Batch upload failed:", error);
		throw error;
	}
}

// Example 7: Error handling wrapper
export async function safeUpload(file: File, options: Record<string, unknown> = {}) {
	try {
		// Check if Cloudinary is configured
		if (!CloudinaryService.isConfigured()) {
			throw new Error("Cloudinary is not configured");
		}

		// Check file size (example: 10MB limit)
		const maxSize = 10 * 1024 * 1024; // 10MB
		if (file.size > maxSize) {
			throw new Error("File size exceeds 10MB limit");
		}

		// Check file type
		const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
		if (!allowedTypes.includes(file.type)) {
			throw new Error("File type not supported");
		}

		// Proceed with upload
		const result = await CloudinaryService.uploadImage(file, options);
		return { success: true, data: result };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}
