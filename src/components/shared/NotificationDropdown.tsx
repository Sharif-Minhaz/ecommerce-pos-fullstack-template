"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Bell, Check, Clock, ShoppingCart, Truck, Store, Gift, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
	DropdownMenuItem,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import {
	getUnreadNotificationCount,
	getUserNotifications,
	markNotificationAsRead,
	markAllNotificationsAsRead,
} from "@/app/actions/notification";
import { formatDistanceToNow } from "date-fns";

// =============== notification icon mapping ================
const getNotificationIcon = (type: string) => {
	switch (type) {
		case "cart":
			return <ShoppingCart className="h-4 w-4" />;
		case "order":
			return <Clock className="h-4 w-4" />;
		case "rider":
			return <Truck className="h-4 w-4" />;
		case "vendor":
			return <Store className="h-4 w-4" />;
		case "promotion":
			return <Gift className="h-4 w-4" />;
		case "system":
			return <AlertCircle className="h-4 w-4" />;
		default:
			return <Bell className="h-4 w-4" />;
	}
};

// =============== notification priority colors ================
const getPriorityColor = (priority: string) => {
	switch (priority) {
		case "high":
			return "text-red-600";
		case "medium":
			return "text-yellow-600";
		case "low":
			return "text-green-600";
		default:
			return "text-gray-600";
	}
};

interface Notification {
	_id: string;
	text: string;
	createdAt: string;
	isRead: boolean;
	notificationType: string;
	priority: string;
	actionUrl?: string;
	metadata?: Record<string, unknown>;
}

export function NotificationDropdown() {
	const { data: session } = useSession();
	const [unreadCount, setUnreadCount] = useState(0);
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [isOpen, setIsOpen] = useState(false);
	const [loading, setLoading] = useState(false);

	// =============== fetch unread count ================
	const fetchUnreadCount = useCallback(async () => {
		if (!session?.user?.id) return;

		try {
			const result = await getUnreadNotificationCount();
			if (result.success) {
				setUnreadCount(result.count || 0);
			}
		} catch (error) {
			console.error("Error fetching unread count:", error);
		}
	}, [session?.user?.id]);

	// =============== fetch notifications ================
	const fetchNotifications = async () => {
		if (!session?.user?.id) return;

		setLoading(true);
		try {
			const result = await getUserNotifications(10, 0);
			if (result.success) {
				setNotifications((result.notifications || []) as unknown as Notification[]);
			}
		} catch (error) {
			console.error("Error fetching notifications:", error);
		} finally {
			setLoading(false);
		}
	};

	// =============== mark notification as read ================
	const handleMarkAsRead = async (notificationId: string) => {
		try {
			const result = await markNotificationAsRead(notificationId);
			if (result.success) {
				setNotifications((prev) =>
					prev.map((notif) => (notif._id === notificationId ? { ...notif, isRead: true } : notif))
				);
				setUnreadCount((prev) => Math.max(0, prev - 1));
			}
		} catch (error) {
			console.error("Error marking notification as read:", error);
		}
	};

	// =============== mark all as read ================
	const handleMarkAllAsRead = async () => {
		try {
			const result = await markAllNotificationsAsRead();
			if (result.success) {
				setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
				setUnreadCount(0);
			}
		} catch (error) {
			console.error("Error marking all notifications as read:", error);
		}
	};

	// =============== handle dropdown open ================
	const handleOpenChange = (open: boolean) => {
		setIsOpen(open);
		if (open) {
			fetchNotifications();
		}
	};

	// =============== handle notification click ================
	const handleNotificationClick = async (notification: Notification) => {
		if (!notification.isRead) {
			await handleMarkAsRead(notification._id);
		}

		if (notification.actionUrl) {
			window.location.href = notification.actionUrl;
		}
	};

	// =============== fetch unread count on mount and session change ================
	useEffect(() => {
		if (session?.user?.id) {
			fetchUnreadCount();
		}
	}, [session?.user?.id, fetchUnreadCount]);

	// =============== refresh unread count periodically ================
	useEffect(() => {
		if (!session?.user?.id) return;

		const interval = setInterval(fetchUnreadCount, 30000); // refresh every 30 seconds
		return () => clearInterval(interval);
	}, [session?.user?.id, fetchUnreadCount]);

	if (!session) return null;

	return (
		<DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full">
					<Bell className="h-5 w-5" />
					{unreadCount > 0 && (
						<Badge
							variant="destructive"
							className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
						>
							{unreadCount > 99 ? "99+" : unreadCount}
						</Badge>
					)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-80 max-h-96 overflow-hidden">
				<div className="flex items-center justify-between p-3 border-b">
					<h3 className="font-semibold text-sm">Notifications</h3>
					{unreadCount > 0 && (
						<Button variant="ghost" size="sm" onClick={handleMarkAllAsRead} className="h-6 px-2 text-xs">
							<Check className="h-3 w-3 mr-1" />
							Mark all as read
						</Button>
					)}
				</div>

				<div className="max-h-80 overflow-y-auto">
					{loading ? (
						<div className="p-4 text-center text-sm text-muted-foreground">Loading notifications...</div>
					) : notifications.length === 0 ? (
						<div className="p-4 text-center text-sm text-muted-foreground">No notifications yet</div>
					) : (
						notifications.map((notification) => (
							<DropdownMenuItem
								key={notification._id}
								onClick={() => handleNotificationClick(notification)}
								className="p-0 cursor-pointer"
							>
								<Card
									className={`w-full m-1 p-3 border-l-4 ${
										notification.isRead
											? "border-l-gray-300 bg-gray-50/50"
											: "border-l-blue-500 bg-blue-50/50"
									}`}
								>
									<div className="flex items-start gap-3">
										<div
											className={`flex-shrink-0 mt-0.5 ${
												notification.isRead ? "text-gray-400" : "text-blue-600"
											}`}
										>
											{getNotificationIcon(notification.notificationType)}
										</div>
										<div className="flex-1 min-w-0">
											<p
												className={`text-sm ${
													notification.isRead ? "text-gray-600" : "text-gray-900"
												}`}
											>
												{notification.text}
											</p>
											<div className="flex items-center justify-between mt-1">
												<span className="text-xs text-muted-foreground">
													{formatDistanceToNow(new Date(notification.createdAt))}
												</span>
												<span className={`text-xs ${getPriorityColor(notification.priority)}`}>
													{notification.priority}
												</span>
											</div>
										</div>
										{!notification.isRead && (
											<div className="flex-shrink-0">
												<div className="w-2 h-2 bg-blue-500 rounded-full"></div>
											</div>
										)}
									</div>
								</Card>
							</DropdownMenuItem>
						))
					)}
				</div>

				{notifications.length > 0 && (
					<>
						<DropdownMenuSeparator />
						<DropdownMenuItem className="text-center text-sm text-muted-foreground">
							View all notifications
						</DropdownMenuItem>
					</>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
