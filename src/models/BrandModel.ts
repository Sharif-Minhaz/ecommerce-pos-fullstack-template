import mongoose, { Schema } from "mongoose";
import slugify from "slugify";
import { IBrand } from "@/types/brand";

const brandSchema = new Schema<IBrand>(
	{
		name: {
			type: String,
			required: [true, "Brand name is required"],
			trim: true,
			unique: true,
		},
		nameBN: {
			type: String,
			required: [true, "Brand name in Bengali is required"],
			trim: true,
			unique: true,
		},
		slug: {
			type: String,
			unique: true,
			lowercase: true,
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
		imageKey: {
			type: String,
		},
		products: [
			{
				type: Schema.Types.ObjectId,
				ref: "Product",
			},
		],
		isActive: {
			type: Boolean,
			default: true,
		},
		createdBy: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

// Create slug from name before saving
brandSchema.pre("save", async function (next) {
	if (!this.isModified("name")) {
		return next();
	}

	try {
		const brandDoc = this as unknown as mongoose.Document & { name: string; slug: string };
		let slug = slugify(brandDoc.name, { lower: true });
		let count = 0;
		const originalSlug = slug;

		// Check if slug exists and append number if it does
		while (await (this.constructor as mongoose.Model<IBrand>).findOne({ slug })) {
			count++;
			slug = `${originalSlug}-${count}`;
		}

		brandDoc.slug = slug;
		next();
	} catch (error) {
		next(error as Error);
	}
});

// Create indexes
brandSchema.index({ slug: 1 });
brandSchema.index({ isActive: 1 });

export const Brand = mongoose.models.Brand || mongoose.model<IBrand>("Brand", brandSchema);
