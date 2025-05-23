import mongoose, { Schema } from "mongoose";
import { IProduct } from "@/types/product";
import slugify from "slugify";

const productSchema = new Schema<IProduct>(
	{
		title: {
			type: String,
			required: [true, "Product title is required"],
			trim: true,
			minlength: [3, "Title must be at least 3 characters long"],
			maxlength: [200, "Title cannot exceed 200 characters"],
		},
		titleBN: {
			type: String,
			required: [true, "Product title in Bengali is required"],
			trim: true,
			minlength: [3, "Bengali title must be at least 3 characters long"],
			maxlength: [200, "Bengali title cannot exceed 200 characters"],
		},
		slug: {
			type: String,
			unique: true,
			lowercase: true,
		},
		description: {
			type: String,
			required: [true, "Product description is required"],
			trim: true,
			minlength: [10, "Description must be at least 10 characters long"],
			maxlength: [5000, "Description cannot exceed 5000 characters"],
		},
		descriptionBN: {
			type: String,
			required: [true, "Product description in Bengali is required"],
			trim: true,
			minlength: [10, "Bengali description must be at least 10 characters long"],
			maxlength: [5000, "Bengali description cannot exceed 5000 characters"],
		},
		gallery: [
			{
				type: String,
				required: [true, "Product image URL is required"],
				validate: {
					validator: function (v: string) {
						return /^https?:\/\/.+/.test(v);
					},
					message: "Image URL must be a valid URL",
				},
			},
		],
		unit: {
			type: String,
			required: [true, "Product unit is required"],
			enum: {
				values: ["kg", "pcs", "g", "l", "ml", "box", "pack", "pair", "set", "dozen"],
				message: "{VALUE} is not a valid unit",
			},
		},
		stock: {
			type: Number,
			required: [true, "Product stock is required"],
			min: [0, "Stock cannot be negative"],
			default: 0,
		},
		price: {
			type: Number,
			required: [true, "Product price is required"],
			min: [0, "Price cannot be negative"],
		},
		salePrice: {
			type: Number,
			min: [0, "Sale price cannot be negative"],
			validate: {
				validator: function (this: IProduct, v: number) {
					return v <= this.price;
				},
				message: "Sale price cannot be greater than regular price",
			},
		},
		discountRate: {
			type: Number,
			min: [0, "Discount rate cannot be negative"],
			max: [100, "Discount rate cannot exceed 100%"],
			validate: {
				validator: function (this: IProduct, v: number) {
					if (this.salePrice) {
						const calculatedDiscount =
							((this.price - this.salePrice) / this.price) * 100;
						return Math.abs(v - calculatedDiscount) < 0.01; // allow small floating point differences
					}
					return true;
				},
				message: "Discount rate must match the difference between price and sale price",
			},
		},
		highlights: {
			type: String,
			required: [true, "Product highlights are required"],
			trim: true,
		},
		highlightsBN: {
			type: String,
			required: [true, "Product highlights in Bengali are required"],
			trim: true,
		},
		specification: {
			type: String,
			required: [true, "Product specification is required"],
			trim: true,
		},
		specificationBN: {
			type: String,
			required: [true, "Product specification in Bengali is required"],
			trim: true,
		},
		category: {
			type: Schema.Types.ObjectId,
			ref: "Category",
			required: [true, "Product category is required"],
		},
		brand: {
			type: Schema.Types.ObjectId,
			ref: "Brand",
			required: [true, "Product brand is required"],
		},
		vendor: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: [true, "Product vendor is required"],
		},
		sku: {
			type: String,
			required: [true, "Product SKU is required"],
			unique: true,
			trim: true,
		},
		barcode: {
			type: String,
			trim: true,
			unique: true,
			sparse: true,
		},
		weight: {
			type: Number,
			min: [0, "Weight cannot be negative"],
		},
		dimensions: {
			length: {
				type: Number,
				min: [0, "Length cannot be negative"],
			},
			width: {
				type: Number,
				min: [0, "Width cannot be negative"],
			},
			height: {
				type: Number,
				min: [0, "Height cannot be negative"],
			},
		},
		tags: [
			{
				type: String,
				trim: true,
			},
		],
		isActive: {
			type: Boolean,
			default: true,
		},
		isFeatured: {
			type: Boolean,
			default: false,
		},
		warranty: {
			type: String,
			trim: true,
		},
		warrantyBN: {
			type: String,
			trim: true,
		},
		shippingInfo: {
			weight: {
				type: Number,
				min: [0, "Shipping weight cannot be negative"],
			},
			dimensions: {
				length: {
					type: Number,
					min: [0, "Length cannot be negative"],
				},
				width: {
					type: Number,
					min: [0, "Width cannot be negative"],
				},
				height: {
					type: Number,
					min: [0, "Height cannot be negative"],
				},
			},
			freeShipping: {
				type: Boolean,
				default: false,
			},
		},
		seo: {
			title: {
				type: String,
				trim: true,
				maxlength: [60, "SEO title cannot exceed 60 characters"],
			},
			description: {
				type: String,
				trim: true,
				maxlength: [160, "SEO description cannot exceed 160 characters"],
			},
			keywords: [
				{
					type: String,
					trim: true,
				},
			],
		},
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

productSchema.index({ title: "text", titleBN: "text", description: "text", descriptionBN: "text" });
productSchema.index({ category: 1, brand: 1, vendor: 1 });
productSchema.index({ sku: 1 }, { unique: true });
productSchema.index({ barcode: 1 }, { sparse: true });

productSchema.virtual("discountPercentage").get(function (this: IProduct) {
	if (!this.salePrice || !this.price) return 0;
	return Math.round(((this.price - this.salePrice) / this.price) * 100);
});

productSchema.virtual("inStock").get(function (this: IProduct) {
	return this.stock > 0;
});

// Create slug from title before saving
productSchema.pre("save", async function (next) {
	if (!this.isModified("title")) {
		return next();
	}

	try {
		let slug = slugify(this.title, { lower: true });
		let count = 0;
		const originalSlug = slug;

		// Check if slug exists and append number if it does
		while (await (this.constructor as mongoose.Model<IProduct>).findOne({ slug })) {
			count++;
			slug = `${originalSlug}-${count}`;
		}

		this.slug = slug;
		next();
	} catch (error) {
		next(error as Error);
	}
});

export const Product =
	mongoose.models.Product || mongoose.model<IProduct>("Product", productSchema);
