"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import NotificationModel, { INotification } from "@/models/NotificationModel";
import { connectToDatabase } from "@/db";
import { NotificationTemplate, createNotificationFromTemplate } from "@/lib/notification-templates";

// =============== extend notification model with static methods ================
interface NotificationModelWithStatics {
	getUnreadCount(userId: string): Promise<number>;
	getUserNotifications(userId: string, limit: number, skip: number): Promise<INotification[]>;
	markAsRead(notificationId: string, userId: string): Promise<INotification | null>;
	markAllAsRead(userId: string): Promise<unknown>;
}

// =============== get user session helper ================
async function getCurrentUser() {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) {
		throw new Error("User not authenticated");
	}
	return session.user;
}

// =============== get unread notification count ================
export async function getUnreadNotificationCount(): Promise<{ success: boolean; count?: number; error?: string }> {
	try {
		await connectToDatabase();
		const user = await getCurrentUser();

		const count = await (NotificationModel as unknown as NotificationModelWithStatics).getUnreadCount(user.id);
		return { success: true, count };
	} catch (error) {
		console.error("Error getting unread notification count:", error);
		return { success: false, error: "Failed to get notification count" };
	}
}

// =============== get user notifications ================
export async function getUserNotifications(
	limit: number = 20,
	skip: number = 0
): Promise<{ success: boolean; notifications?: INotification[]; error?: string }> {
	try {
		await connectToDatabase();
		const user = await getCurrentUser();

		const notifications = await (NotificationModel as unknown as NotificationModelWithStatics).getUserNotifications(
			user.id,
			limit,
			skip
		);
		return { success: true, notifications };
	} catch (error) {
		console.error("Error getting user notifications:", error);
		return { success: false, error: "Failed to get notifications" };
	}
}

// =============== mark notification as read ================
export async function markNotificationAsRead(notificationId: string): Promise<{ success: boolean; error?: string }> {
	try {
		await connectToDatabase();
		const user = await getCurrentUser();

		await (NotificationModel as unknown as NotificationModelWithStatics).markAsRead(notificationId, user.id);
		revalidatePath("/");
		return { success: true };
	} catch (error) {
		console.error("Error marking notification as read:", error);
		return { success: false, error: "Failed to mark notification as read" };
	}
}

// =============== mark all notifications as read ================
export async function markAllNotificationsAsRead(): Promise<{ success: boolean; error?: string }> {
	try {
		await connectToDatabase();
		const user = await getCurrentUser();

		await (NotificationModel as unknown as NotificationModelWithStatics).markAllAsRead(user.id);
		revalidatePath("/");
		return { success: true };
	} catch (error) {
		console.error("Error marking all notifications as read:", error);
		return { success: false, error: "Failed to mark all notifications as read" };
	}
}

// =============== create notification ================
export async function createNotification(
	text: string,
	recipients: string[],
	notificationType: "order" | "cart" | "rider" | "vendor" | "system" | "promotion",
	options?: {
		priority?: "low" | "medium" | "high";
		actionUrl?: string;
		relatedId?: string;
		metadata?: Record<string, unknown>;
	}
): Promise<{ success: boolean; notification?: INotification; error?: string }> {
	try {
		await connectToDatabase();

		const notification = new NotificationModel({
			text,
			recipients,
			notificationType,
			priority: options?.priority || "medium",
			actionUrl: options?.actionUrl,
			relatedId: options?.relatedId,
			metadata: options?.metadata || {},
			isRead: false,
			readBy: [],
		});

		await notification.save();
		revalidatePath("/");
		return { success: true, notification };
	} catch (error) {
		console.error("Error creating notification:", error);
		return { success: false, error: "Failed to create notification" };
	}
}

// =============== create notification from template ================
export async function createNotificationFromTemplateAction(
	template: NotificationTemplate,
	recipients: string[],
	relatedId?: string
): Promise<{ success: boolean; notification?: INotification; error?: string }> {
	try {
		await connectToDatabase();

		const notificationData = createNotificationFromTemplate(template, recipients, relatedId);
		const notification = new NotificationModel(notificationData);

		await notification.save();
		revalidatePath("/");
		return { success: true, notification };
	} catch (error) {
		console.error("Error creating notification from template:", error);
		return { success: false, error: "Failed to create notification from template" };
	}
}

// =============== delete notification ================
export async function deleteNotification(notificationId: string): Promise<{ success: boolean; error?: string }> {
	try {
		await connectToDatabase();
		const user = await getCurrentUser();

		// only allow users to delete their own notifications
		await NotificationModel.findOneAndDelete({
			_id: notificationId,
			recipients: user.id,
		});

		revalidatePath("/");
		return { success: true };
	} catch (error) {
		console.error("Error deleting notification:", error);
		return { success: false, error: "Failed to delete notification" };
	}
}
