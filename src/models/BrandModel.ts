import mongoose, { Schema } from "mongoose";
import { IBrand } from "@/types/brand";

const brandSchema = new Schema<IBrand>(
	{
		title: {
			type: String,
			required: [true, "Brand title is required"],
			trim: true,
			unique: true,
			minlength: [2, "Title must be at least 2 characters long"],
			maxlength: [100, "Title cannot exceed 100 characters"],
		},
		titleBN: {
			type: String,
			required: [true, "Brand title in Bengali is required"],
			trim: true,
			unique: true,
			minlength: [2, "Bengali title must be at least 2 characters long"],
			maxlength: [100, "Bengali title cannot exceed 100 characters"],
		},
		description: {
			type: String,
			required: [true, "Brand description is required"],
			trim: true,
			minlength: [10, "Description must be at least 10 characters long"],
			maxlength: [1000, "Description cannot exceed 1000 characters"],
		},
		descriptionBN: {
			type: String,
			required: [true, "Brand description in Bengali is required"],
			trim: true,
			minlength: [10, "Bengali description must be at least 10 characters long"],
			maxlength: [1000, "Bengali description cannot exceed 1000 characters"],
		},
		image: {
			type: String,
			required: [true, "Brand image is required"],
			validate: {
				validator: function (v: string) {
					return /^https?:\/\/.+/.test(v);
				},
				message: "Image URL must be a valid URL",
			},
		},
	},
	{
		timestamps: true,
	}
);

// Indexes
brandSchema.index({ title: "text", titleBN: "text" });

export const Brand = mongoose.models.Brand || mongoose.model<IBrand>("Brand", brandSchema);
