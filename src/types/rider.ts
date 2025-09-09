import { Document, PopulatedDoc } from "mongoose";
import { IUser } from "./user";
import { ISales } from "./sales";

export type VehicleType = "bike" | "car" | "motorcycle" | "scooter";
export type RiderStatus = "available" | "busy" | "offline" | "suspended";
export type DeliveryStatus = "assigned" | "accepted" | "rejected" | "picked_up" | "delivered" | "failed";

export interface VehicleInfo {
	vehicleType: VehicleType;
	brand: string;
	model: string;
	year: number;
	color: string;
	licensePlate: string;
	engineNumber?: string;
	chassisNumber?: string;
	registrationNumber: string;
	insuranceNumber?: string;
	insuranceExpiry?: Date;
	drivingLicenseNumber: string;
	drivingLicenseExpiry: Date;
	vehicleImage?: string;
	licenseImage?: string;
	insuranceImage?: string;
}

export interface RiderDelivery {
	order: PopulatedDoc<ISales & Document>;
	assignedAt: Date;
	acceptedAt?: Date;
	rejectedAt?: Date;
	rejectionReason?: string;
	pickedUpAt?: Date;
	deliveredAt?: Date;
	status: DeliveryStatus;
	deliveryNotes?: string;
	deliveryProof?: string; // image url
}

// Base interface without populated fields
export interface IRiderBase {
	user: Document["_id"];
	vehicleInfo: VehicleInfo;
	status: RiderStatus;
	isActive: boolean;
	rating: number;
	totalDeliveries: number;
	successfulDeliveries: number;
	failedDeliveries: number;
	earnings: number;
	bankAccount?: {
		accountNumber: string;
		bankName: string;
		accountHolderName: string;
		branchName?: string;
	};
	emergencyContact: {
		name: string;
		phone: string;
		relationship: string;
	};
	serviceAreas: string[]; // city names where rider can deliver
	workingHours: {
		start: string; // HH:MM format
		end: string; // HH:MM format
		days: string[]; // ["monday", "tuesday", etc.]
	};
	createdAt: Date;
	updatedAt: Date;
}

// Interface for when fields are populated
export interface IRiderPopulated extends IRiderBase {
	user: IUser;
	deliveries: RiderDelivery[];
}

// Interface for when fields are not populated
export interface IRiderUnpopulated extends IRiderBase {
	deliveries: Document["_id"][];
}

// Main interface that can handle both populated and unpopulated states
export interface IRider extends Document, IRiderUnpopulated {
	// This allows the fields to be populated
	user: PopulatedDoc<IUser & Document>;
	deliveries: PopulatedDoc<RiderDelivery & Document>[];
}
