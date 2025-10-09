import { Document, PopulatedDoc } from "mongoose";
import { IUser } from "./user";
import { IProduct } from "./product";

export type PurchaseStatus = "pending" | "confirmed" | "received" | "cancelled" | "returned";
export type PaymentStatus = "pending" | "partial" | "paid" | "overdue";

export interface PurchaseItem {
	product: PopulatedDoc<IProduct & Document>;
	quantity: number;
	purchasePrice: number;
	totalPrice: number;
	receivedQuantity?: number;
	damagedQuantity?: number;
	notes?: string;
}

export interface SupplierDetails {
	name: string;
	phone: string;
	email?: string;
	address: string;
	city: string;
	state?: string;
	postalCode: string;
	country: string;
	shopName: string;
	taxId?: string;
	additionalInfo?: string;
}

// Base interface without populated fields
export interface IPurchaseBase {
	purchaseNumber: string;
	purchaseDate: Date;
	items: PurchaseItem[];
	subtotal: number;
	discount: number;
	discountType?: "percentage" | "flat";
	vat: number;
	deliveryCharge: number;
	totalAmount: number;
	paymentStatus: PaymentStatus;
	purchaseStatus: PurchaseStatus;
	supplierDetails: SupplierDetails;
	paid: number;
	due: number;
	returnAmount: number;
	paymentMethod?: string;
	expectedDeliveryDate?: Date;
	actualDeliveryDate?: Date;
	notes?: string;
	attachments?: string[];
	terms?: string;
	currency?: string;
	exchangeRate?: number;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

// Interface for when fields are populated
export interface IPurchasePopulated extends IPurchaseBase {
	vendor: IUser;
}

// Interface for when fields are not populated
export interface IPurchaseUnpopulated extends IPurchaseBase {
	vendor: Document["_id"];
}

// Main interface that can handle both populated and unpopulated states
export interface IPurchase extends Document, IPurchaseUnpopulated {
	// This allows the fields to be populated
	vendor: PopulatedDoc<IUser & Document>;
}
