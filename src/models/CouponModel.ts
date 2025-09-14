import mongoose, { Schema } from "mongoose";
import { ICoupon } from "@/types/coupon";

const couponSchema = new Schema(
	{
		vendorId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: [true, "Vendor ID is required"],
		},
		name: {
			type: String,
			required: [true, "Coupon name is required"],
			trim: true,
			minlength: [2, "Name must be at least 2 characters long"],
			maxlength: [100, "Name cannot exceed 100 characters"],
		},
		nameBN: {
			type: String,
			required: [true, "Coupon name in Bengali is required"],
			trim: true,
			minlength: [2, "Bengali name must be at least 2 characters long"],
			maxlength: [100, "Bengali name cannot exceed 100 characters"],
		},
		description: {
			type: String,
			required: [true, "Coupon description is required"],
			trim: true,
			minlength: [10, "Description must be at least 10 characters long"],
			maxlength: [500, "Description cannot exceed 500 characters"],
		},
		descriptionBN: {
			type: String,
			required: [true, "Coupon description in Bengali is required"],
			trim: true,
			minlength: [10, "Bengali description must be at least 10 characters long"],
			maxlength: [500, "Bengali description cannot exceed 500 characters"],
		},
		code: {
			type: String,
			required: [true, "Coupon code is required"],
			unique: true,
			trim: true,
			uppercase: true,
			minlength: [3, "Code must be at least 3 characters long"],
			maxlength: [20, "Code cannot exceed 20 characters"],
		},
		validTill: {
			type: Date,
			required: [true, "Coupon validity end date is required"],
			validate: {
				validator: function (v: Date) {
					return v > new Date();
				},
				message: "Valid till date must be in the future",
			},
		},
		amount: {
			type: Number,
			required: [true, "Discount amount is required"],
			min: [0, "Amount cannot be negative"],
			validate: {
				validator: function (this: ICoupon, v: number) {
					if (this.type === "percentage") {
						return v <= 100;
					}
					return true;
				},
				message: "Percentage discount cannot exceed 100%",
			},
		},
		type: {
			type: String,
			required: [true, "Discount type is required"],
			enum: {
				values: ["percentage", "flat"],
				message: "{VALUE} is not a valid discount type",
			},
		},
		minPurchase: {
			type: Number,
			min: [0, "Minimum purchase amount cannot be negative"],
		},
		maxDiscount: {
			type: Number,
			min: [0, "Maximum discount amount cannot be negative"],
			validate: {
				validator: function (this: ICoupon, v: number) {
					if (this.type === "flat") {
						return v >= this.amount;
					}
					return true;
				},
				message: "Maximum discount must be greater than or equal to flat discount amount",
			},
		},
		isActive: {
			type: Boolean,
			default: true,
		},
	},
	{
		timestamps: true,
	}
);

// Indexes
couponSchema.index({ code: 1 }, { unique: true });
couponSchema.index({ validTill: 1 });
couponSchema.index({ isActive: 1 });
couponSchema.index({ vendorId: 1 });

export const Coupon = mongoose.models.Coupon || mongoose.model<ICoupon>("Coupon", couponSchema);
