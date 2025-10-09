import mongoose, { Schema } from "mongoose";
import { IPurchase } from "@/types/purchase";

const purchaseItemSchema = new Schema({
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
	purchasePrice: {
		type: Number,
		required: [true, "Purchase price is required"],
		min: [0, "Purchase price cannot be negative"],
	},
	totalPrice: {
		type: Number,
		required: [true, "Total price is required"],
		min: [0, "Total price cannot be negative"],
	},
	receivedQuantity: {
		type: Number,
		min: [0, "Received quantity cannot be negative"],
		default: 0,
	},
	damagedQuantity: {
		type: Number,
		min: [0, "Damaged quantity cannot be negative"],
		default: 0,
	},
	notes: {
		type: String,
		trim: true,
		maxlength: [200, "Notes cannot exceed 200 characters"],
	},
});

const supplierDetailsSchema = new Schema({
	name: {
		type: String,
		required: [true, "Supplier name is required"],
		trim: true,
		minlength: [2, "Name must be at least 2 characters long"],
		maxlength: [100, "Name cannot exceed 100 characters"],
	},
	phone: {
		type: String,
		required: [true, "Supplier phone is required"],
		trim: true,
		match: [/^[+]?[\d\s\-()]{6,}$/, "Please enter a valid phone number"],
	},
	email: {
		type: String,
		trim: true,
		lowercase: true,
		match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
	},
	address: {
		type: String,
		required: [true, "Supplier address is required"],
		trim: true,
		minlength: [3, "Address must be at least 3 characters long"],
		maxlength: [500, "Address cannot exceed 500 characters"],
	},
	city: {
		type: String,
		required: [true, "City is required"],
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
		required: [true, "Postal code is required"],
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
	shopName: {
		type: String,
		required: [true, "Shop name is required"],
		trim: true,
		minlength: [2, "Shop name must be at least 2 characters long"],
		maxlength: [100, "Shop name cannot exceed 100 characters"],
	},
	taxId: {
		type: String,
		trim: true,
		maxlength: [50, "Tax ID cannot exceed 50 characters"],
	},
	additionalInfo: {
		type: String,
		trim: true,
		maxlength: [200, "Additional info cannot exceed 200 characters"],
	},
});

const purchaseSchema = new Schema<IPurchase>(
	{
		purchaseNumber: {
			type: String,
			required: [true, "Purchase number is required"],
			unique: true,
			trim: true,
			default: function () {
				const date = new Date();
				const dateStr =
					date.getFullYear().toString() +
					(date.getMonth() + 1).toString().padStart(2, "0") +
					date.getDate().toString().padStart(2, "0");
				const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
				return `PUR-${dateStr}-${randomStr}`;
			},
		},
		purchaseDate: {
			type: Date,
			required: [true, "Purchase date is required"],
			default: Date.now,
		},
		items: {
			type: [purchaseItemSchema],
			required: [true, "Purchase items are required"],
			validate: {
				validator: function (v: (typeof purchaseItemSchema)[]) {
					return v.length > 0;
				},
				message: "Purchase must have at least one item",
			},
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
		vat: {
			type: Number,
			required: [true, "VAT is required"],
			min: [0, "VAT cannot be negative"],
			default: 0,
		},
		deliveryCharge: {
			type: Number,
			required: [true, "Delivery charge is required"],
			min: [0, "Delivery charge cannot be negative"],
			default: 0,
		},
		totalAmount: {
			type: Number,
			required: [true, "Total amount is required"],
			min: [0, "Total amount cannot be negative"],
		},
		paymentStatus: {
			type: String,
			required: [true, "Payment status is required"],
			enum: {
				values: ["pending", "partial", "paid", "overdue"],
				message: "{VALUE} is not a valid payment status",
			},
			default: "pending",
		},
		purchaseStatus: {
			type: String,
			required: [true, "Purchase status is required"],
			enum: {
				values: ["pending", "confirmed", "received", "cancelled", "returned"],
				message: "{VALUE} is not a valid purchase status",
			},
			default: "pending",
		},
		vendor: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: [true, "Vendor is required"],
		},
		supplierDetails: {
			type: supplierDetailsSchema,
			required: [true, "Supplier details are required"],
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
		paymentMethod: {
			type: String,
			trim: true,
			maxlength: [50, "Payment method cannot exceed 50 characters"],
		},
		expectedDeliveryDate: {
			type: Date,
			validate: {
				validator: function (v: Date) {
					return v > new Date();
				},
				message: "Expected delivery date must be in the future",
			},
		},
		actualDeliveryDate: {
			type: Date,
		},
		notes: {
			type: String,
			trim: true,
			maxlength: [500, "Notes cannot exceed 500 characters"],
		},
		attachments: [
			{
				type: String,
				trim: true,
				validate: {
					validator: function (v: string) {
						return /^https?:\/\/.+/.test(v);
					},
					message: "Attachment must be a valid URL",
				},
			},
		],
		terms: {
			type: String,
			trim: true,
			maxlength: [1000, "Terms cannot exceed 1000 characters"],
		},
		currency: {
			type: String,
			trim: true,
			maxlength: [3, "Currency code cannot exceed 3 characters"],
			default: "BDT",
		},
		exchangeRate: {
			type: Number,
			min: [0, "Exchange rate cannot be negative"],
			default: 1,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
	},
	{
		timestamps: true,
	}
);

// =============== indexes for better query performance ================
purchaseSchema.index({ purchaseNumber: 1 }, { unique: true });
purchaseSchema.index({ vendor: 1 });
purchaseSchema.index({ purchaseStatus: 1 });
purchaseSchema.index({ paymentStatus: 1 });
purchaseSchema.index({ purchaseDate: -1 });
purchaseSchema.index({ "supplierDetails.shopName": 1 });
purchaseSchema.index({ "supplierDetails.name": 1 });
purchaseSchema.index({ isActive: 1 });

// =============== virtual for calculating total items ================
purchaseSchema.virtual("totalItems").get(function (this: IPurchase) {
	return this.items.reduce((total: number, item: { quantity: number }) => total + item.quantity, 0);
});

// =============== virtual for calculating received items ================
purchaseSchema.virtual("totalReceivedItems").get(function (this: IPurchase) {
	return this.items.reduce(
		(total: number, item: { receivedQuantity?: number }) => total + (item.receivedQuantity || 0),
		0
	);
});

// =============== virtual for calculating damaged items ================
purchaseSchema.virtual("totalDamagedItems").get(function (this: IPurchase) {
	return this.items.reduce(
		(total: number, item: { damagedQuantity?: number }) => total + (item.damagedQuantity || 0),
		0
	);
});

// =============== pre-save middleware to generate purchase number ================
purchaseSchema.pre("save", function (this: IPurchase, next) {
	if (this.isNew && !this.purchaseNumber) {
		// Generate purchase number: PUR-YYYYMMDD-XXXXX
		const date = new Date();
		const dateStr =
			date.getFullYear().toString() +
			(date.getMonth() + 1).toString().padStart(2, "0") +
			date.getDate().toString().padStart(2, "0");
		const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
		this.purchaseNumber = `PUR-${dateStr}-${randomStr}`;
	}
	next();
});

// =============== method to calculate totals ================
purchaseSchema.methods.calculateTotals = function (this: IPurchase) {
	const subtotal = this.items.reduce((total: number, item: { totalPrice: number }) => total + item.totalPrice, 0);
	const discountAmount = this.discountType === "percentage" ? (subtotal * this.discount) / 100 : this.discount;
	const finalSubtotal = subtotal - discountAmount;
	const vatAmount = (finalSubtotal * this.vat) / 100;
	const totalAmount = finalSubtotal + vatAmount + this.deliveryCharge;

	this.subtotal = subtotal;
	this.totalAmount = totalAmount;
	this.due = Math.max(0, totalAmount - this.paid);
	this.returnAmount = Math.max(0, this.paid - totalAmount);

	return {
		subtotal,
		discountAmount,
		finalSubtotal,
		vatAmount,
		totalAmount,
		due: this.due,
	};
};

// =============== method to update payment status ================
purchaseSchema.methods.updatePaymentStatus = function (this: IPurchase) {
	if (this.paid >= this.totalAmount) {
		this.paymentStatus = "paid";
	} else if (this.paid > 0) {
		this.paymentStatus = "partial";
	} else {
		this.paymentStatus = "pending";
	}
	return this.paymentStatus;
};

// =============== method to update purchase status ================
purchaseSchema.methods.updatePurchaseStatus = function (this: IPurchase) {
	if (this.purchaseStatus === "received") {
		this.actualDeliveryDate = new Date();
	} else if (this.purchaseStatus === "cancelled") {
		this.isActive = false;
	}
	return this.purchaseStatus;
};

// =============== method to receive items ================
purchaseSchema.methods.receiveItems = function (
	this: IPurchase,
	receivedItems: Array<{ productId: string; receivedQuantity: number; damagedQuantity?: number }>
) {
	receivedItems.forEach(({ productId, receivedQuantity, damagedQuantity = 0 }) => {
		const itemIndex = this.items.findIndex((item) => {
			const prod = item.product as unknown as mongoose.Types.ObjectId | { _id?: mongoose.Types.ObjectId };
			const idString =
				typeof (prod as mongoose.Types.ObjectId).toString === "function"
					? (prod as mongoose.Types.ObjectId).toString()
					: String((prod as { _id?: mongoose.Types.ObjectId })._id);
			return idString === productId;
		});
		if (itemIndex !== -1) {
			this.items[itemIndex].receivedQuantity = (this.items[itemIndex].receivedQuantity || 0) + receivedQuantity;
			this.items[itemIndex].damagedQuantity = (this.items[itemIndex].damagedQuantity || 0) + damagedQuantity;
		}
	});

	// Check if all items are received
	const allReceived = this.items.every((item) => (item.receivedQuantity || 0) >= item.quantity);

	if (allReceived) {
		this.purchaseStatus = "received";
		this.actualDeliveryDate = new Date();
	}

	return this.purchaseStatus;
};

// =============== method to calculate profit margin ================
purchaseSchema.methods.calculateProfitMargin = function (this: IPurchase, sellingPrice: number) {
	const totalPurchaseCost = this.totalAmount;
	const profit = sellingPrice - totalPurchaseCost;
	const profitMargin = (profit / totalPurchaseCost) * 100;

	return {
		totalPurchaseCost,
		sellingPrice,
		profit,
		profitMargin,
	};
};

export const Purchase = mongoose.models.Purchase || mongoose.model<IPurchase>("Purchase", purchaseSchema);
