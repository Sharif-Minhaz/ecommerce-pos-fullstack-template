import { Document, PopulatedDoc } from "mongoose";
import { IUser } from "./user";
import { IProduct } from "./product";

// Base interface without populated fields
export interface IReviewBase {
	rating: number;
	review: string;
	isVerified: boolean;
	createdAt: Date;
	updatedAt: Date;
}

// Interface for when fields are populated
export interface IReviewPopulated extends IReviewBase {
	product: IProduct;
	user: IUser;
}

// Interface for when fields are not populated
export interface IReviewUnpopulated extends IReviewBase {
	product: Document["_id"];
	user: Document["_id"];
}

// Main interface that can handle both populated and unpopulated states
export interface IReview extends Document, IReviewUnpopulated {
	// This allows the fields to be populated
	product: PopulatedDoc<IProduct & Document>;
	user: PopulatedDoc<IUser & Document>;
}
