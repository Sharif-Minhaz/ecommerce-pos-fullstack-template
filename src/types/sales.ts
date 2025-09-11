import { Document, PopulatedDoc } from "mongoose";
import { IUser } from "./user";
import { IProduct } from "./product";
import { ICoupon } from "./coupon";

export type PaymentMethod = "cod" | "stripe" | "sslcommerz";
export type OrderStatus = "pending" | "approved" | "rejected" | "processing" | "shipped" | "delivered" | "cancelled";

export type DeliveryStatus =
	| "pending_assignment"
	| "assigned"
	| "accepted"
	| "rejected"
	| "picked_up"
	| "delivered"
	| "failed";

export interface OrderItem {
	product: PopulatedDoc<IProduct & Document>;
	quantity: number;
	unitPrice: number;
	totalPrice: number;
}

export interface DeliveryDetails {
	name: string;
	phone?: string;
	email?: string;
	address?: string;
	city?: string;
	state?: string;
	postalCode?: string;
	country: string;
	additionalInfo?: string;
}

export interface Location {
	type: "Point";
	coordinates: [number, number]; // [longitude, latitude]
	address: string;
}

// Base interface without populated fields
export interface ISalesBase {
	orderNumber: string;
	orderName: string;
	orderDate: Date;
	items: OrderItem[];
	actualPrice: number;
	deliveryCharge: number;
	subtotal: number;
	discount: number;
	discountType?: "percentage" | "flat";
	couponDiscount?: number;
	totalAmount: number;
	paymentMethod: PaymentMethod;
	status: OrderStatus;
	deliveryDetails: DeliveryDetails;
	location?: Location;
	paid: number;
	due: number;
	notes?: string;
	estimatedDeliveryDate?: Date;
	actualDeliveryDate?: Date;
	trackingNumber?: string;
	shippingMethod?: string;
	taxAmount?: number;
	refundAmount?: number;
	refundReason?: string;
	isPaid: boolean;
	isDelivered: boolean;
	isCancelled: boolean;
	// =============== rider assignment fields ================
	assignedRider?: Document["_id"];
	riderAssignmentDate?: Date;
	riderAcceptedDate?: Date;
	riderRejectedDate?: Date;
	riderRejectionReason?: string;
	deliveryStatus: DeliveryStatus;
	deliveryNotes?: string;
	deliveryProof?: string;
	createdAt: Date;
	updatedAt: Date;
}

// Interface for when fields are populated
export interface ISalesPopulated extends ISalesBase {
	user: IUser;
	coupon?: ICoupon;
}

// Interface for when fields are not populated
export interface ISalesUnpopulated extends ISalesBase {
	user: Document["_id"];
	coupon?: Document["_id"];
	assignedRider?: Document["_id"];
}

// Main interface that can handle both populated and unpopulated states
export interface ISales extends Document, ISalesUnpopulated {
	// This allows the fields to be populated
	user: PopulatedDoc<IUser & Document>;
	coupon?: PopulatedDoc<ICoupon & Document>;
}
