import { Document, PopulatedDoc } from "mongoose";

// Base interface without populated fields
export interface ICategoryBase {
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
export interface ICategoryPopulated extends ICategoryBase {
	parent: ICategoryPopulated | null;
	children: ICategoryPopulated[];
}

// Interface for when fields are not populated
export interface ICategoryUnpopulated extends ICategoryBase {
	parent: Document["_id"] | null;
	children: Document["_id"][];
}

// Main interface that can handle both populated and unpopulated states
export interface ICategory extends Document, ICategoryUnpopulated {
	// This allows the fields to be populated
	parent: PopulatedDoc<ICategory & Document> | null;
	children: PopulatedDoc<ICategory & Document>[];
}
