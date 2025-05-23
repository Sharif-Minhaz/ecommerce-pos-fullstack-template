import { Document } from "mongoose";

export type DiscountType = "percentage" | "flat";

export interface ICoupon extends Document {
	name: string;
	nameBN: string;
	description: string;
	descriptionBN: string;
	code: string;
	validTill: Date;
	amount: number;
	type: DiscountType;
	minPurchase?: number;
	maxDiscount?: number;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}
