import mongoose, { Schema } from "mongoose";
import slugify from "slugify";
import { ICategory } from "@/types/category";

const categorySchema = new Schema<ICategory>(
	{
		name: {
			type: String,
			required: [true, "Category name is required"],
			trim: true,
			unique: true,
		},
		nameBN: {
			type: String,
			required: [true, "Category name in Bengali is required"],
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
		imageKey: {
			type: String,
		},
		parent: {
			type: Schema.Types.ObjectId,
			ref: "Category",
			default: null,
		},
		children: [
			{
				type: Schema.Types.ObjectId,
				ref: "Category",
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
categorySchema.pre("save", async function (next) {
	if (!this.isModified("name")) {
		return next();
	}

	try {
		const categoryDoc = this as unknown as mongoose.Document & { name: string; slug: string };
		let slug = slugify(categoryDoc.name, { lower: true });
		let count = 0;
		const originalSlug = slug;

		// Check if slug exists and append number if it does
		while (await (this.constructor as mongoose.Model<ICategory>).findOne({ slug })) {
			count++;
			slug = `${originalSlug}-${count}`;
		}

		categoryDoc.slug = slug;
		next();
	} catch (error) {
		next(error as Error);
	}
});

// Create indexes
categorySchema.index({ parent: 1 });
categorySchema.index({ isActive: 1 });

export const Category = mongoose.models.Category || mongoose.model<ICategory>("Category", categorySchema);
