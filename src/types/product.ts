import { Document, PopulatedDoc } from "mongoose";
import { IUser } from "./user";
import { ICategory } from "./category";
import { IBrand } from "./brand";

export type ProductUnit =
	| "kg"
	| "pcs"
	| "g"
	| "l"
	| "ml"
	| "box"
	| "pack"
	| "pair"
	| "set"
	| "dozen";

// Base interface without populated fields
export interface IProductBase {
	title: string;
	titleBN: string;
	slug: string;
	description: string;
	descriptionBN: string;
	gallery: string[];
	unit: ProductUnit;
	stock: number;
	price: number;
	salePrice?: number;
	discountRate?: number;
	highlights: string;
	highlightsBN: string;
	specification: string;
	specificationBN: string;
	sku: string;
	barcode?: string;
	weight?: number;
	dimensions?: {
		length: number;
		width: number;
		height: number;
	};
	tags: string[];
	isActive: boolean;
	isFeatured: boolean;
	warranty?: string;
	warrantyBN?: string;
	shippingInfo?: {
		weight: number;
		dimensions: {
			length: number;
			width: number;
			height: number;
		};
		freeShipping: boolean;
	};
	seo?: {
		title: string;
		description: string;
		keywords: string[];
	};
	createdAt: Date;
	updatedAt: Date;
}

// Interface for when fields are populated
export interface IProductPopulated extends IProductBase {
	category: ICategory;
	brand: IBrand;
	vendor: IUser;
}

// Interface for when fields are not populated
export interface IProductUnpopulated extends IProductBase {
	category: Document["_id"];
	brand: Document["_id"];
	vendor: Document["_id"];
}

// Main interface that can handle both populated and unpopulated states
export interface IProduct extends Document, IProductUnpopulated {
	// This allows the fields to be populated
	category: PopulatedDoc<ICategory & Document>;
	brand: PopulatedDoc<IBrand & Document>;
	vendor: PopulatedDoc<IUser & Document>;
}
