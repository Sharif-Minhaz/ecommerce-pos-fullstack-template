import { Document, PopulatedDoc } from "mongoose";
import { IProduct } from "./product";

// Base interface without populated fields
export interface IUserBase {
	name: string;
	email: string;
	phoneNumber: string;
	is_ban: boolean;
	userType: "user" | "vendor" | "admin" | "rider";
	password?: string;
	image?: string;
	shopName?: string;
	shopDescription?: string;
	shopImages?: string[];
	registrationNumber?: string;
	createdAt: Date;
	updatedAt: Date;
	createdBy: string;
}

// Interface for when fields are populated
export interface IUserPopulated extends IUserBase {
	wishlist: IProduct[];
}

// Interface for when fields are not populated
export interface IUserUnpopulated extends IUserBase {
	wishlist: Document["_id"][];
}

// Main interface that can handle both populated and unpopulated states
export interface IUser extends Document, IUserUnpopulated {
	// This allows the fields to be populated
	wishlist: PopulatedDoc<IProduct & Document>[];
}
