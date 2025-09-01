import { Document, PopulatedDoc } from "mongoose";

// Base interface without populated fields
export interface IBrandBase {
	name: string;
	nameBN: string;
	slug: string;
	description?: string;
	descriptionBN?: string;
	image?: string;
	isActive: boolean;
	imageKey?: string;
	createdAt: Date;
	updatedAt: Date;
	createdBy: Document["_id"];
}

// Interface for when fields are populated
export interface IBrandPopulated extends IBrandBase {
	products: Document[]; // =============== using Document[] to avoid circular reference with IProduct ================
}

// Interface for when fields are not populated
export interface IBrandUnpopulated extends IBrandBase {
	products: Document["_id"][];
}

// Main interface that can handle both populated and unpopulated states
export interface IBrand extends Document, IBrandUnpopulated {
	// This allows the fields to be populated
	products: PopulatedDoc<Document>[]; // =============== using Document to avoid circular reference with IProduct ================
}
