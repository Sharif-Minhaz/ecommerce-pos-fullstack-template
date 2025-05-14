import mongoose, { Schema } from "mongoose";
import { IReview } from "@/types/review";

const reviewSchema = new Schema<IReview>(
	{
		product: {
			type: Schema.Types.ObjectId,
			ref: "Product",
			required: [true, "Product reference is required"],
		},
		user: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: [true, "User reference is required"],
		},
		rating: {
			type: Number,
			required: [true, "Rating is required"],
			min: [1, "Rating must be at least 1"],
			max: [5, "Rating cannot exceed 5"],
		},
		review: {
			type: String,
			required: [true, "Review text is required"],
			trim: true,
			minlength: [10, "Review must be at least 10 characters long"],
			maxlength: [1000, "Review cannot exceed 1000 characters"],
		},
		isVerified: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
	}
);

// Indexes
reviewSchema.index({ product: 1, user: 1 }, { unique: true }); // One review per user per product
reviewSchema.index({ product: 1, rating: 1 });
reviewSchema.index({ isVerified: 1 });

export const Review = mongoose.models.Review || mongoose.model<IReview>("Review", reviewSchema);
