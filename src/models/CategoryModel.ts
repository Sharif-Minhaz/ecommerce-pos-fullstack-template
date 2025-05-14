import mongoose, { Schema } from "mongoose";
import { ICategory } from "@/types/category";

const categorySchema = new Schema<ICategory>(
	{
		title: {
			type: String,
			required: [true, "Category title is required"],
			trim: true,
			unique: true,
			minlength: [2, "Title must be at least 2 characters long"],
			maxlength: [100, "Title cannot exceed 100 characters"],
		},
		titleBN: {
			type: String,
			required: [true, "Category title in Bengali is required"],
			trim: true,
			unique: true,
			minlength: [2, "Bengali title must be at least 2 characters long"],
			maxlength: [100, "Bengali title cannot exceed 100 characters"],
		},
		description: {
			type: String,
			required: [true, "Category description is required"],
			trim: true,
			minlength: [10, "Description must be at least 10 characters long"],
			maxlength: [1000, "Description cannot exceed 1000 characters"],
		},
		descriptionBN: {
			type: String,
			required: [true, "Category description in Bengali is required"],
			trim: true,
			minlength: [10, "Bengali description must be at least 10 characters long"],
			maxlength: [1000, "Bengali description cannot exceed 1000 characters"],
		},
		image: {
			type: String,
			required: [true, "Category image is required"],
			validate: {
				validator: function (v: string) {
					return /^https?:\/\/.+/.test(v);
				},
				message: "Image URL must be a valid URL",
			},
		},
		parent: {
			type: Schema.Types.ObjectId,
			ref: "Category",
		},
	},
	{
		timestamps: true,
	}
);

// Indexes
categorySchema.index({ title: "text", titleBN: "text" });
categorySchema.index({ parent: 1 });

export const Category =
	mongoose.models.Category || mongoose.model<ICategory>("Category", categorySchema);
