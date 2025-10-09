import mongoose, { Schema } from "mongoose";
import { ISales } from "@/types/sales";

const orderItemSchema = new Schema({
	product: {
		type: Schema.Types.ObjectId,
		ref: "Product",
		required: [true, "Product is required"],
	},
	quantity: {
		type: Number,
		required: [true, "Quantity is required"],
		min: [1, "Quantity must be at least 1"],
	},
	unitPrice: {
		type: Number,
		required: [true, "Unit price is required"],
		min: [0, "Unit price cannot be negative"],
	},
	totalPrice: {
		type: Number,
		required: [true, "Total price is required"],
		min: [0, "Total price cannot be negative"],
	},
});

const deliveryDetailsSchema = new Schema({
	name: {
		type: String,
		// =============== optional for POS sales ================
		trim: true,
		minlength: [2, "Name must be at least 2 characters long"],
		maxlength: [100, "Name cannot exceed 100 characters"],
	},
	phone: {
		type: String,
		// =============== optional for POS ================
		trim: true,
		match: [/^\+?[1-9]\d{1,14}$/, "Please enter a valid international phone number"],
	},
	email: {
		type: String,
		trim: true,
		lowercase: true,
		match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
	},
	address: {
		type: String,
		// =============== optional for POS ================
		trim: true,
		minlength: [10, "Address must be at least 10 characters long"],
		maxlength: [500, "Address cannot exceed 500 characters"],
	},
	city: {
		type: String,
		// =============== optional for POS ================
		trim: true,
		minlength: [2, "City must be at least 2 characters long"],
		maxlength: [50, "City cannot exceed 50 characters"],
	},
	state: {
		type: String,
		trim: true,
		maxlength: [50, "State cannot exceed 50 characters"],
	},
	postalCode: {
		type: String,
		// =============== optional for POS ================
		trim: true,
		minlength: [3, "Postal code must be at least 3 characters long"],
		maxlength: [20, "Postal code cannot exceed 20 characters"],
	},
	country: {
		type: String,
		required: [true, "Country is required"],
		trim: true,
		minlength: [2, "Country must be at least 2 characters long"],
		maxlength: [50, "Country cannot exceed 50 characters"],
		default: "Bangladesh",
	},
	additionalInfo: {
		type: String,
		trim: true,
		maxlength: [200, "Additional info cannot exceed 200 characters"],
	},
});

const locationSchema = new Schema({
	type: {
		type: String,
		enum: ["Point"],
		default: "Point",
	},
	coordinates: {
		type: [Number],
		required: [true, "Coordinates are required"],
		validate: {
			validator: function (v: number[]) {
				return v.length === 2 && v[0] >= -180 && v[0] <= 180 && v[1] >= -90 && v[1] <= 90;
			},
			message: "Coordinates must be [longitude, latitude] with valid ranges",
		},
	},
	address: {
		type: String,
		required: [true, "Location address is required"],
		trim: true,
	},
});

const salesSchema = new Schema<ISales>(
	{
		orderNumber: {
			type: String,
			required: [true, "Order number is required"],
			unique: true,
			trim: true,
		},
		orderName: {
			type: String,
			required: [true, "Order name is required"],
			trim: true,
			minlength: [3, "Order name must be at least 3 characters long"],
			maxlength: [200, "Order name cannot exceed 200 characters"],
		},
		orderDate: {
			type: Date,
			required: [true, "Order date is required"],
			default: Date.now,
		},
		items: {
			type: [orderItemSchema],
			required: [true, "Order items are required"],
			validate: {
				validator: function (v: (typeof orderItemSchema)[]) {
					return v.length > 0;
				},
				message: "Order must have at least one item",
			},
		},
		actualPrice: {
			type: Number,
			required: [true, "Actual price is required"],
			min: [0, "Actual price cannot be negative"],
		},
		deliveryCharge: {
			type: Number,
			required: [true, "Delivery charge is required"],
			min: [0, "Delivery charge cannot be negative"],
			default: 50, // =============== default delivery charge is 50tk ================
		},
		subtotal: {
			type: Number,
			required: [true, "Subtotal is required"],
			min: [0, "Subtotal cannot be negative"],
		},
		discount: {
			type: Number,
			required: [true, "Discount is required"],
			min: [0, "Discount cannot be negative"],
			default: 0,
		},
		discountType: {
			type: String,
			enum: {
				values: ["percentage", "flat"],
				message: "{VALUE} is not a valid discount type",
			},
		},
		coupon: {
			type: Schema.Types.ObjectId,
			ref: "Coupon",
		},
		couponDiscount: {
			type: Number,
			min: [0, "Coupon discount cannot be negative"],
			default: 0,
		},
		totalAmount: {
			type: Number,
			required: [true, "Total amount is required"],
			min: [0, "Total amount cannot be negative"],
		},
		paymentMethod: {
			type: String,
			enum: {
				values: ["cod", "stripe", "sslcommerz", "cash"],
				message: "{VALUE} is not a valid payment method",
			},
			default: "cash",
		},
		status: {
			type: String,
			required: [true, "Order status is required"],
			enum: {
				values: ["pending", "approved", "rejected", "processing", "shipped", "delivered", "cancelled"],
				message: "{VALUE} is not a valid order status",
			},
			default: "pending",
		},
		user: {
			type: Schema.Types.ObjectId,
			ref: "User",
		},
		deliveryDetails: {
			type: deliveryDetailsSchema,
			// =============== optional for POS sales ================
		},
		location: {
			type: locationSchema,
		},
		paid: {
			type: Number,
			required: [true, "Paid amount is required"],
			min: [0, "Paid amount cannot be negative"],
			default: 0,
		},
		due: {
			type: Number,
			required: [true, "Due amount is required"],
			min: [0, "Due amount cannot be negative"],
			default: 0,
		},
		returnAmount: {
			type: Number,
			min: [0, "Return amount cannot be negative"],
			default: 0,
		},
		notes: {
			type: String,
			trim: true,
			maxlength: [500, "Notes cannot exceed 500 characters"],
		},
		estimatedDeliveryDate: {
			type: Date,
			validate: {
				validator: function (v: Date) {
					return v > new Date();
				},
				message: "Estimated delivery date must be in the future",
			},
		},
		actualDeliveryDate: {
			type: Date,
		},
		trackingNumber: {
			type: String,
			trim: true,
			maxlength: [100, "Tracking number cannot exceed 100 characters"],
		},
		shippingMethod: {
			type: String,
			trim: true,
			maxlength: [100, "Shipping method cannot exceed 100 characters"],
		},
		taxAmount: {
			type: Number,
			min: [0, "Tax amount cannot be negative"],
			default: 0,
		},
		refundAmount: {
			type: Number,
			min: [0, "Refund amount cannot be negative"],
			default: 0,
		},
		refundReason: {
			type: String,
			trim: true,
			maxlength: [200, "Refund reason cannot exceed 200 characters"],
		},
		isPaid: {
			type: Boolean,
			default: false,
		},
		isDelivered: {
			type: Boolean,
			default: false,
		},
		isCancelled: {
			type: Boolean,
			default: false,
		},
		// =============== rider assignment fields ================
		assignedRider: {
			type: Schema.Types.ObjectId,
			ref: "Rider",
		},
		riderAssignmentDate: {
			type: Date,
		},
		riderAcceptedDate: {
			type: Date,
		},
		riderRejectedDate: {
			type: Date,
		},
		riderRejectionReason: {
			type: String,
			trim: true,
			maxlength: [200, "Rider rejection reason cannot exceed 200 characters"],
		},
		deliveryStatus: {
			type: String,
			enum: {
				values: ["pending_assignment", "assigned", "accepted", "rejected", "picked_up", "delivered", "failed"],
				message: "{VALUE} is not a valid delivery status",
			},
			default: "pending_assignment",
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
	},
	{
		timestamps: true,
	}
);

// =============== indexes for better query performance ================
salesSchema.index({ user: 1 });
salesSchema.index({ status: 1 });
salesSchema.index({ orderDate: -1 });
salesSchema.index({ paymentMethod: 1 });
salesSchema.index({ isPaid: 1 });
salesSchema.index({ isDelivered: 1 });
salesSchema.index({ "deliveryDetails.city": 1 });
salesSchema.index({ location: "2dsphere" });
salesSchema.index({ assignedRider: 1 });
salesSchema.index({ deliveryStatus: 1 });

// =============== virtual for calculating total items ================
salesSchema.virtual("totalItems").get(function (this: ISales) {
	return this.items.reduce((total: number, item: { quantity: number }) => total + item.quantity, 0);
});

// =============== pre-save middleware to generate order number ================
salesSchema.pre("save", function (this: ISales, next) {
	if (this.isNew && !this.orderNumber) {
		// Generate order number: ORD-YYYYMMDD-XXXXX
		const date = new Date();
		const dateStr =
			date.getFullYear().toString() +
			(date.getMonth() + 1).toString().padStart(2, "0") +
			date.getDate().toString().padStart(2, "0");
		const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
		this.orderNumber = `ORD-${dateStr}-${randomStr}`;
	}
	next();
});

// =============== method to calculate totals ================
salesSchema.methods.calculateTotals = function (this: ISales) {
	const subtotal = this.items.reduce((total: number, item: { totalPrice: number }) => total + item.totalPrice, 0);
	const discountAmount = this.discountType === "percentage" ? (subtotal * this.discount) / 100 : this.discount;
	const finalSubtotal = subtotal - discountAmount - (this.couponDiscount || 0);
	const totalAmount = finalSubtotal + this.deliveryCharge + (this.taxAmount || 0);

	this.subtotal = subtotal;
	this.totalAmount = totalAmount;
	this.due = Math.max(0, totalAmount - this.paid);
	this.returnAmount = Math.max(0, this.paid - totalAmount);

	return {
		subtotal,
		discountAmount,
		finalSubtotal,
		totalAmount,
		due: this.due,
	};
};

// =============== method to update payment status ================
salesSchema.methods.updatePaymentStatus = function (this: ISales) {
	this.isPaid = this.paid >= this.totalAmount;
	return this.isPaid;
};

// =============== method to update delivery status ================
salesSchema.methods.updateDeliveryStatus = function (this: ISales) {
	if (this.status === "delivered") {
		this.isDelivered = true;
		this.actualDeliveryDate = new Date();
	} else if (this.status === "cancelled") {
		this.isCancelled = true;
	}
	return this.isDelivered;
};

export const Sales = mongoose.models.Sales || mongoose.model<ISales>("Sales", salesSchema);
