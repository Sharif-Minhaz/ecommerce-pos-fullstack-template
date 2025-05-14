import { Document, PopulatedDoc } from "mongoose";
import { IProduct } from "./product";

// Base interface without populated fields
export interface IBrandBase {
	name: string;
	nameBN: string;
	slug: string;
	description?: string;
	descriptionBN?: string;
	image?: string;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

// Interface for when fields are populated
export interface IBrandPopulated extends IBrandBase {
	products: IProduct[];
}

// Interface for when fields are not populated
export interface IBrandUnpopulated extends IBrandBase {
	products: Document["_id"][];
}

// Main interface that can handle both populated and unpopulated states
export interface IBrand extends Document, IBrandUnpopulated {
	// This allows the fields to be populated
	products: PopulatedDoc<IProduct & Document>[];
}
