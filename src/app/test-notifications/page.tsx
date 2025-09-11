"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { notificationFactory } from "@/lib/notification-factory";

export default function TestNotificationsPage() {
	const { data: session } = useSession();
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState("");

	// =============== test notification functions ================
	const testCartNotification = async () => {
		if (!session?.user?.id) return;
		setLoading(true);
		try {
			await notificationFactory.cartItemAdded(session.user.id, "Test Product");
			setMessage("Cart notification sent!");
		} catch {
			setMessage("Error sending cart notification");
		} finally {
			setLoading(false);
		}
	};

	const testOrderNotification = async () => {
		if (!session?.user?.id) return;
		setLoading(true);
		try {
			await notificationFactory.orderPlaced(session.user.id, "TEST-001");
			setMessage("Order notification sent!");
		} catch {
			setMessage("Error sending order notification");
		} finally {
			setLoading(false);
		}
	};

	const testSystemNotification = async () => {
		if (!session?.user?.id) return;
		setLoading(true);
		try {
			await notificationFactory.welcome(session.user.id, session.user.name || "User");
			setMessage("System notification sent!");
		} catch {
			setMessage("Error sending system notification");
		} finally {
			setLoading(false);
		}
	};

	const testPromotionNotification = async () => {
		if (!session?.user?.id) return;
		setLoading(true);
		try {
			await notificationFactory.newOffer([session.user.id], "Black Friday Sale", 50);
			setMessage("Promotion notification sent!");
		} catch {
			setMessage("Error sending promotion notification");
		} finally {
			setLoading(false);
		}
	};

	if (!session) {
		return (
			<div className="container mx-auto p-8">
				<Card>
					<CardHeader>
						<CardTitle>Test Notifications</CardTitle>
						<CardDescription>Please log in to test notifications</CardDescription>
					</CardHeader>
				</Card>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-8">
			<Card>
				<CardHeader>
					<CardTitle>Test Notifications</CardTitle>
					<CardDescription>
						Click the buttons below to test different types of notifications. Check the notification bell in
						the header to see them.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<Button onClick={testCartNotification} disabled={loading} className="h-20">
							Test Cart Notification
						</Button>

						<Button onClick={testOrderNotification} disabled={loading} className="h-20">
							Test Order Notification
						</Button>

						<Button onClick={testSystemNotification} disabled={loading} className="h-20">
							Test System Notification
						</Button>

						<Button onClick={testPromotionNotification} disabled={loading} className="h-20">
							Test Promotion Notification
						</Button>
					</div>

					{message && <div className="p-4 bg-green-100 border border-green-400 rounded-md">{message}</div>}
				</CardContent>
			</Card>
		</div>
	);
}
