import { INotification } from "@/models/NotificationModel";

// =============== notification template types ================
export interface NotificationTemplate {
	text: string;
	notificationType: "order" | "cart" | "rider" | "vendor" | "system" | "promotion";
	priority: "low" | "medium" | "high";
	actionUrl?: string;
	metadata?: Record<string, unknown>;
}

// =============== cart related notifications ================
export const cartNotifications = {
	itemAdded: (productName: string): NotificationTemplate => ({
		text: `"${productName}" has been added to your cart`,
		notificationType: "cart",
		priority: "low",
		actionUrl: "/cart",
		metadata: { productName },
	}),

	itemRemoved: (productName: string): NotificationTemplate => ({
		text: `"${productName}" has been removed from your cart`,
		notificationType: "cart",
		priority: "low",
		actionUrl: "/cart",
		metadata: { productName },
	}),

	cartAbandoned: (): NotificationTemplate => ({
		text: "You have items in your cart waiting for checkout",
		notificationType: "cart",
		priority: "medium",
		actionUrl: "/cart",
	}),
};

// =============== order related notifications ================
export const orderNotifications = {
	orderPlaced: (orderId: string): NotificationTemplate => ({
		text: `Your order #${orderId} has been placed successfully`,
		notificationType: "order",
		priority: "high",
		actionUrl: `/my-orders`,
		metadata: { orderId },
	}),

	orderAccepted: (orderId: string, vendorName: string): NotificationTemplate => ({
		text: `Your order #${orderId} has been accepted by ${vendorName}`,
		notificationType: "order",
		priority: "high",
		actionUrl: `/my-orders`,
		metadata: { orderId, vendorName },
	}),

	orderRejected: (orderId: string, vendorName: string, reason?: string): NotificationTemplate => ({
		text: `Your order #${orderId} has been rejected by ${vendorName}${reason ? ` - ${reason}` : ""}`,
		notificationType: "order",
		priority: "high",
		actionUrl: `/my-orders`,
		metadata: { orderId, vendorName, reason },
	}),

	orderShipped: (orderId: string, trackingNumber?: string): NotificationTemplate => ({
		text: `Your order #${orderId} has been shipped${trackingNumber ? ` - Tracking: ${trackingNumber}` : ""}`,
		notificationType: "order",
		priority: "high",
		actionUrl: `/my-orders`,
		metadata: { orderId, trackingNumber },
	}),

	orderDelivered: (orderId: string): NotificationTemplate => ({
		text: `Your order #${orderId} has been delivered successfully`,
		notificationType: "order",
		priority: "high",
		actionUrl: `/my-orders`,
		metadata: { orderId },
	}),

	orderCancelled: (orderId: string, reason?: string): NotificationTemplate => ({
		text: `Your order #${orderId} has been cancelled${reason ? ` - ${reason}` : ""}`,
		notificationType: "order",
		priority: "high",
		actionUrl: `/my-orders`,
		metadata: { orderId, reason },
	}),
};

// =============== rider related notifications ================
export const riderNotifications = {
	riderAssigned: (orderId: string, riderName: string): NotificationTemplate => ({
		text: `Rider ${riderName} has been assigned to your order #${orderId}`,
		notificationType: "rider",
		priority: "high",
		actionUrl: `/my-orders`,
		metadata: { orderId, riderName },
	}),

	riderOnTheWay: (orderId: string, riderName: string): NotificationTemplate => ({
		text: `Rider ${riderName} is on the way to deliver your order #${orderId}`,
		notificationType: "rider",
		priority: "high",
		actionUrl: `/my-orders`,
		metadata: { orderId, riderName },
	}),

	deliveryUpdate: (orderId: string, status: string): NotificationTemplate => ({
		text: `Delivery update for order #${orderId}: ${status}`,
		notificationType: "rider",
		priority: "medium",
		actionUrl: `/my-orders`,
		metadata: { orderId, status },
	}),

	newDeliveryRequest: (orderId: string, customerName: string, address: string): NotificationTemplate => ({
		text: `New delivery request: Order #${orderId} from ${customerName} at ${address}`,
		notificationType: "rider",
		priority: "high",
		actionUrl: `/rider/accept-order/${orderId}`,
		metadata: { orderId, customerName, address },
	}),

	deliveryAccepted: (orderId: string, customerName: string): NotificationTemplate => ({
		text: `You have accepted delivery for order #${orderId} from ${customerName}`,
		notificationType: "rider",
		priority: "medium",
		actionUrl: `/rider/dashboard`,
		metadata: { orderId, customerName },
	}),

	deliveryRejected: (orderId: string, customerName: string): NotificationTemplate => ({
		text: `You have rejected delivery for order #${orderId} from ${customerName}`,
		notificationType: "rider",
		priority: "medium",
		actionUrl: `/rider/dashboard`,
		metadata: { orderId, customerName },
	}),
};

// =============== vendor related notifications ================
export const vendorNotifications = {
	newOrder: (orderId: string, customerName: string, totalAmount: number): NotificationTemplate => ({
		text: `New order #${orderId} from ${customerName} - Total: $${totalAmount}`,
		notificationType: "vendor",
		priority: "high",
		actionUrl: `/my-shop/manage-orders`,
		metadata: { orderId, customerName, totalAmount },
	}),

	orderCancelled: (orderId: string, customerName: string): NotificationTemplate => ({
		text: `Order #${orderId} from ${customerName} has been cancelled`,
		notificationType: "vendor",
		priority: "medium",
		actionUrl: `/my-shop/manage-orders`,
		metadata: { orderId, customerName },
	}),

	paymentReceived: (orderId: string, amount: number): NotificationTemplate => ({
		text: `Payment received for order #${orderId} - Amount: $${amount}`,
		notificationType: "vendor",
		priority: "high",
		actionUrl: `/my-shop/manage-orders`,
		metadata: { orderId, amount },
	}),

	lowStock: (productName: string, currentStock: number): NotificationTemplate => ({
		text: `Low stock alert: "${productName}" has only ${currentStock} items left`,
		notificationType: "vendor",
		priority: "medium",
		actionUrl: `/my-shop/products`,
		metadata: { productName, currentStock },
	}),

	productReview: (productName: string, rating: number, customerName: string): NotificationTemplate => ({
		text: `New review for "${productName}": ${rating} stars by ${customerName}`,
		notificationType: "vendor",
		priority: "low",
		actionUrl: `/my-shop/products`,
		metadata: { productName, rating, customerName },
	}),
};

// =============== system notifications ================
export const systemNotifications = {
	welcome: (userName: string): NotificationTemplate => ({
		text: `Welcome to E-commerce POS, ${userName}! Start exploring our products.`,
		notificationType: "system",
		priority: "low",
		actionUrl: "/products",
		metadata: { userName },
	}),

	accountVerified: (): NotificationTemplate => ({
		text: "Your account has been verified successfully",
		notificationType: "system",
		priority: "medium",
		actionUrl: "/profile",
	}),

	passwordChanged: (): NotificationTemplate => ({
		text: "Your password has been changed successfully",
		notificationType: "system",
		priority: "medium",
		actionUrl: "/profile",
	}),

	maintenanceMode: (): NotificationTemplate => ({
		text: "System maintenance scheduled. Some features may be temporarily unavailable.",
		notificationType: "system",
		priority: "high",
	}),
};

// =============== promotion notifications ================
export const promotionNotifications = {
	newOffer: (offerTitle: string, discountPercent: number): NotificationTemplate => ({
		text: `New offer: ${offerTitle} - ${discountPercent}% off!`,
		notificationType: "promotion",
		priority: "medium",
		actionUrl: "/products",
		metadata: { offerTitle, discountPercent },
	}),

	flashSale: (productName: string, timeLeft: string): NotificationTemplate => ({
		text: `Flash sale: "${productName}" - ${timeLeft} left!`,
		notificationType: "promotion",
		priority: "high",
		actionUrl: "/products",
		metadata: { productName, timeLeft },
	}),

	couponExpiring: (couponCode: string, daysLeft: number): NotificationTemplate => ({
		text: `Your coupon ${couponCode} expires in ${daysLeft} days`,
		notificationType: "promotion",
		priority: "medium",
		actionUrl: "/cart",
		metadata: { couponCode, daysLeft },
	}),
};

// =============== helper function to create notification from template ================
export const createNotificationFromTemplate = (
	template: NotificationTemplate,
	recipients: string[],
	relatedId?: string
): Partial<INotification> => ({
	text: template.text,
	recipients,
	notificationType: template.notificationType,
	priority: template.priority,
	actionUrl: template.actionUrl,
	relatedId,
	metadata: template.metadata,
	isRead: false,
	readBy: [],
});
