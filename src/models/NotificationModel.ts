import mongoose, { Document, Schema } from "mongoose";
import { connectToDatabase } from "@/db";

// =============== notification interface definition ================
export interface INotification extends Document {
	text: string;
	createdAt: Date;
	updatedAt: Date;
	recipients: string[]; // array of user IDs who should see this notification
	isRead: boolean;
	readBy: string[]; // array of user IDs who have read this notification
	notificationType: "order" | "cart" | "rider" | "vendor" | "system" | "promotion";
	relatedId?: string; // ID of related entity (order, product, etc.)
	priority: "low" | "medium" | "high";
	actionUrl?: string; // URL to navigate when notification is clicked
	metadata?: Record<string, unknown>; // additional data for the notification
}

// =============== notification schema definition ================
const notificationSchema = new Schema<INotification>(
	{
		text: {
			type: String,
			required: true,
			maxlength: 500,
		},
		recipients: [
			{
				type: Schema.Types.ObjectId,
				ref: "User",
				required: true,
			},
		],
		isRead: {
			type: Boolean,
			default: false,
		},
		readBy: [
			{
				type: Schema.Types.ObjectId,
				ref: "User",
			},
		],
		notificationType: {
			type: String,
			enum: ["order", "cart", "rider", "vendor", "system", "promotion"],
			required: true,
		},
		relatedId: {
			type: String,
		},
		priority: {
			type: String,
			enum: ["low", "medium", "high"],
			default: "medium",
		},
		actionUrl: {
			type: String,
		},
		metadata: {
			type: Schema.Types.Mixed,
			default: {},
		},
	},
	{
		timestamps: true,
	}
);

// =============== indexes for better performance ================
notificationSchema.index({ recipients: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ notificationType: 1 });

// =============== static methods for common queries ================
notificationSchema.statics.getUnreadCount = async function (userId: string) {
	await connectToDatabase();
	return this.countDocuments({
		recipients: userId,
		isRead: false,
	});
};

notificationSchema.statics.getUserNotifications = async function (
	userId: string,
	limit: number = 20,
	skip: number = 0
) {
	await connectToDatabase();
	return this.find({ recipients: userId })
		.sort({ createdAt: -1 })
		.limit(limit)
		.skip(skip)
		.populate("recipients", "name email userType")
		.lean();
};

notificationSchema.statics.markAsRead = async function (notificationId: string, userId: string) {
	await connectToDatabase();
	return this.findByIdAndUpdate(
		notificationId,
		{
			$addToSet: { readBy: userId },
			$set: { isRead: true },
		},
		{ new: true }
	);
};

notificationSchema.statics.markAllAsRead = async function (userId: string) {
	await connectToDatabase();
	return this.updateMany(
		{ recipients: userId, isRead: false },
		{
			$addToSet: { readBy: userId },
			$set: { isRead: true },
		}
	);
};

// =============== create and export the model ================
const NotificationModel =
	mongoose.models.Notification || mongoose.model<INotification>("Notification", notificationSchema);

export default NotificationModel;
