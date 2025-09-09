import mongoose, { Schema } from "mongoose";
import { IRider } from "@/types/rider";

const vehicleInfoSchema = new Schema({
	vehicleType: {
		type: String,
		required: [true, "Vehicle type is required"],
		enum: {
			values: ["bike", "car", "motorcycle", "scooter"],
			message: "{VALUE} is not a valid vehicle type",
		},
	},
	brand: {
		type: String,
		required: [true, "Vehicle brand is required"],
		trim: true,
		minlength: [2, "Brand must be at least 2 characters long"],
		maxlength: [50, "Brand cannot exceed 50 characters"],
	},
	model: {
		type: String,
		required: [true, "Vehicle model is required"],
		trim: true,
		minlength: [2, "Model must be at least 2 characters long"],
		maxlength: [50, "Model cannot exceed 50 characters"],
	},
	year: {
		type: Number,
		required: [true, "Vehicle year is required"],
		min: [1990, "Vehicle year must be 1990 or later"],
		max: [new Date().getFullYear() + 1, "Vehicle year cannot be in the future"],
	},
	color: {
		type: String,
		required: [true, "Vehicle color is required"],
		trim: true,
		minlength: [2, "Color must be at least 2 characters long"],
		maxlength: [30, "Color cannot exceed 30 characters"],
	},
	licensePlate: {
		type: String,
		required: [true, "License plate is required"],
		trim: true,
		uppercase: true,
		minlength: [3, "License plate must be at least 3 characters long"],
		maxlength: [20, "License plate cannot exceed 20 characters"],
	},
	engineNumber: {
		type: String,
		trim: true,
		maxlength: [50, "Engine number cannot exceed 50 characters"],
	},
	chassisNumber: {
		type: String,
		trim: true,
		maxlength: [50, "Chassis number cannot exceed 50 characters"],
	},
	registrationNumber: {
		type: String,
		required: [true, "Registration number is required"],
		trim: true,
		uppercase: true,
		minlength: [5, "Registration number must be at least 5 characters long"],
		maxlength: [30, "Registration number cannot exceed 30 characters"],
	},
	insuranceNumber: {
		type: String,
		trim: true,
		maxlength: [50, "Insurance number cannot exceed 50 characters"],
	},
	insuranceExpiry: {
		type: Date,
		validate: {
			validator: function (v: Date) {
				return !v || v > new Date();
			},
			message: "Insurance expiry must be in the future",
		},
	},
	drivingLicenseNumber: {
		type: String,
		required: [true, "Driving license number is required"],
		trim: true,
		uppercase: true,
		minlength: [5, "Driving license number must be at least 5 characters long"],
		maxlength: [30, "Driving license number cannot exceed 30 characters"],
	},
	drivingLicenseExpiry: {
		type: Date,
		required: [true, "Driving license expiry is required"],
		validate: {
			validator: function (v: Date) {
				return v > new Date();
			},
			message: "Driving license expiry must be in the future",
		},
	},
	vehicleImage: {
		type: String,
		trim: true,
	},
	licenseImage: {
		type: String,
		trim: true,
	},
	insuranceImage: {
		type: String,
		trim: true,
	},
});

const bankAccountSchema = new Schema({
	accountNumber: {
		type: String,
		required: [true, "Account number is required"],
		trim: true,
		minlength: [8, "Account number must be at least 8 characters long"],
		maxlength: [20, "Account number cannot exceed 20 characters"],
	},
	bankName: {
		type: String,
		required: [true, "Bank name is required"],
		trim: true,
		minlength: [2, "Bank name must be at least 2 characters long"],
		maxlength: [100, "Bank name cannot exceed 100 characters"],
	},
	accountHolderName: {
		type: String,
		required: [true, "Account holder name is required"],
		trim: true,
		minlength: [2, "Account holder name must be at least 2 characters long"],
		maxlength: [100, "Account holder name cannot exceed 100 characters"],
	},
	branchName: {
		type: String,
		trim: true,
		maxlength: [100, "Branch name cannot exceed 100 characters"],
	},
});

const emergencyContactSchema = new Schema({
	name: {
		type: String,
		required: [true, "Emergency contact name is required"],
		trim: true,
		minlength: [2, "Emergency contact name must be at least 2 characters long"],
		maxlength: [100, "Emergency contact name cannot exceed 100 characters"],
	},
	phone: {
		type: String,
		required: [true, "Emergency contact phone is required"],
		trim: true,
		match: [/^\+?[1-9]\d{1,14}$/, "Please enter a valid international phone number"],
	},
	relationship: {
		type: String,
		required: [true, "Emergency contact relationship is required"],
		trim: true,
		minlength: [2, "Relationship must be at least 2 characters long"],
		maxlength: [50, "Relationship cannot exceed 50 characters"],
	},
});

const workingHoursSchema = new Schema({
	start: {
		type: String,
		required: [true, "Working start time is required"],
		match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please enter time in HH:MM format"],
	},
	end: {
		type: String,
		required: [true, "Working end time is required"],
		match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please enter time in HH:MM format"],
	},
	days: {
		type: [String],
		required: [true, "Working days are required"],
		validate: {
			validator: function (v: string[]) {
				const validDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
				return v.length > 0 && v.every((day) => validDays.includes(day.toLowerCase()));
			},
			message: "Please provide valid working days",
		},
	},
});

const riderDeliverySchema = new Schema({
	order: {
		type: Schema.Types.ObjectId,
		ref: "Sales",
		required: [true, "Order is required"],
	},
	assignedAt: {
		type: Date,
		required: [true, "Assignment date is required"],
		default: Date.now,
	},
	acceptedAt: {
		type: Date,
	},
	rejectedAt: {
		type: Date,
	},
	rejectionReason: {
		type: String,
		trim: true,
		maxlength: [200, "Rejection reason cannot exceed 200 characters"],
	},
	pickedUpAt: {
		type: Date,
	},
	deliveredAt: {
		type: Date,
	},
	status: {
		type: String,
		required: [true, "Delivery status is required"],
		enum: {
			values: ["assigned", "accepted", "rejected", "picked_up", "delivered", "failed"],
			message: "{VALUE} is not a valid delivery status",
		},
		default: "assigned",
	},
	deliveryNotes: {
		type: String,
		trim: true,
		maxlength: [500, "Delivery notes cannot exceed 500 characters"],
	},
	deliveryProof: {
		type: String,
		trim: true,
	},
});

const riderSchema = new Schema<IRider>(
	{
		user: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: [true, "User is required"],
			unique: true,
		},
		vehicleInfo: {
			type: vehicleInfoSchema,
			required: [true, "Vehicle information is required"],
		},
		status: {
			type: String,
			required: [true, "Rider status is required"],
			enum: {
				values: ["available", "busy", "offline", "suspended"],
				message: "{VALUE} is not a valid rider status",
			},
			default: "offline",
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		rating: {
			type: Number,
			default: 0,
			min: [0, "Rating cannot be negative"],
			max: [5, "Rating cannot exceed 5"],
		},
		totalDeliveries: {
			type: Number,
			default: 0,
			min: [0, "Total deliveries cannot be negative"],
		},
		successfulDeliveries: {
			type: Number,
			default: 0,
			min: [0, "Successful deliveries cannot be negative"],
		},
		failedDeliveries: {
			type: Number,
			default: 0,
			min: [0, "Failed deliveries cannot be negative"],
		},
		earnings: {
			type: Number,
			default: 0,
			min: [0, "Earnings cannot be negative"],
		},
		bankAccount: {
			type: bankAccountSchema,
		},
		emergencyContact: {
			type: emergencyContactSchema,
			required: [true, "Emergency contact is required"],
		},
		serviceAreas: {
			type: [String],
			required: [true, "Service areas are required"],
			validate: {
				validator: function (v: string[]) {
					return v.length > 0;
				},
				message: "At least one service area is required",
			},
		},
		workingHours: {
			type: workingHoursSchema,
			required: [true, "Working hours are required"],
		},
		deliveries: {
			type: [riderDeliverySchema],
			default: [],
		},
	},
	{
		timestamps: true,
	}
);

// =============== indexes for better query performance ================
riderSchema.index({ user: 1 });
riderSchema.index({ status: 1 });
riderSchema.index({ isActive: 1 });
riderSchema.index({ serviceAreas: 1 });
riderSchema.index({ "vehicleInfo.vehicleType": 1 });
riderSchema.index({ rating: -1 });

// =============== virtual for success rate ================
riderSchema.virtual("successRate").get(function (this: IRider) {
	if (this.totalDeliveries === 0) return 0;
	return (this.successfulDeliveries / this.totalDeliveries) * 100;
});

// =============== method to update delivery stats ================
riderSchema.methods.updateDeliveryStats = function (this: IRider, success: boolean) {
	this.totalDeliveries += 1;
	if (success) {
		this.successfulDeliveries += 1;
	} else {
		this.failedDeliveries += 1;
	}
	return this.save();
};

// =============== method to check if rider is available ================
riderSchema.methods.isAvailable = function (this: IRider) {
	return this.isActive && this.status === "available";
};

// =============== method to check if rider works in area ================
riderSchema.methods.worksInArea = function (this: IRider, city: string) {
	return this.serviceAreas.includes(city.toLowerCase());
};

export const Rider = mongoose.models.Rider || mongoose.model<IRider>("Rider", riderSchema);
