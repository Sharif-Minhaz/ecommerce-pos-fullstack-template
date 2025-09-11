import { createNotificationFromTemplateAction } from "@/app/actions/notification";
import {
	cartNotifications,
	orderNotifications,
	riderNotifications,
	vendorNotifications,
	systemNotifications,
	promotionNotifications,
} from "@/lib/notification-templates";

// =============== notification factory functions ================
export const notificationFactory = {
	// cart notifications
	cartItemAdded: async (userId: string, productName: string) => {
		return createNotificationFromTemplateAction(cartNotifications.itemAdded(productName), [userId]);
	},

	cartItemRemoved: async (userId: string, productName: string) => {
		return createNotificationFromTemplateAction(cartNotifications.itemRemoved(productName), [userId]);
	},

	cartAbandoned: async (userId: string) => {
		return createNotificationFromTemplateAction(cartNotifications.cartAbandoned(), [userId]);
	},

	// order notifications
	orderPlaced: async (userId: string, orderId: string) => {
		return createNotificationFromTemplateAction(orderNotifications.orderPlaced(orderId), [userId], orderId);
	},

	orderAccepted: async (userId: string, orderId: string, vendorName: string) => {
		return createNotificationFromTemplateAction(
			orderNotifications.orderAccepted(orderId, vendorName),
			[userId],
			orderId
		);
	},

	orderRejected: async (userId: string, orderId: string, vendorName: string, reason?: string) => {
		return createNotificationFromTemplateAction(
			orderNotifications.orderRejected(orderId, vendorName, reason),
			[userId],
			orderId
		);
	},

	orderShipped: async (userId: string, orderId: string, trackingNumber?: string) => {
		return createNotificationFromTemplateAction(
			orderNotifications.orderShipped(orderId, trackingNumber),
			[userId],
			orderId
		);
	},

	orderDelivered: async (userId: string, orderId: string) => {
		return createNotificationFromTemplateAction(orderNotifications.orderDelivered(orderId), [userId], orderId);
	},

	orderCancelled: async (userId: string, orderId: string, reason?: string) => {
		return createNotificationFromTemplateAction(
			orderNotifications.orderCancelled(orderId, reason),
			[userId],
			orderId
		);
	},

	// rider notifications
	riderAssigned: async (userId: string, orderId: string, riderName: string) => {
		return createNotificationFromTemplateAction(
			riderNotifications.riderAssigned(orderId, riderName),
			[userId],
			orderId
		);
	},

	riderOnTheWay: async (userId: string, orderId: string, riderName: string) => {
		return createNotificationFromTemplateAction(
			riderNotifications.riderOnTheWay(orderId, riderName),
			[userId],
			orderId
		);
	},

	deliveryUpdate: async (userId: string, orderId: string, status: string) => {
		return createNotificationFromTemplateAction(
			riderNotifications.deliveryUpdate(orderId, status),
			[userId],
			orderId
		);
	},

	newDeliveryRequest: async (riderIds: string[], orderId: string, customerName: string, address: string) => {
		return createNotificationFromTemplateAction(
			riderNotifications.newDeliveryRequest(orderId, customerName, address),
			riderIds,
			orderId
		);
	},

	deliveryAccepted: async (userId: string, orderId: string, customerName: string) => {
		return createNotificationFromTemplateAction(
			riderNotifications.deliveryAccepted(orderId, customerName),
			[userId],
			orderId
		);
	},

	deliveryRejected: async (userId: string, orderId: string, customerName: string) => {
		return createNotificationFromTemplateAction(
			riderNotifications.deliveryRejected(orderId, customerName),
			[userId],
			orderId
		);
	},

	// vendor notifications
	newOrder: async (vendorId: string, orderId: string, customerName: string, totalAmount: number) => {
		return createNotificationFromTemplateAction(
			vendorNotifications.newOrder(orderId, customerName, totalAmount),
			[vendorId],
			orderId
		);
	},

	vendorOrderCancelled: async (vendorId: string, orderId: string, customerName: string) => {
		return createNotificationFromTemplateAction(
			vendorNotifications.orderCancelled(orderId, customerName),
			[vendorId],
			orderId
		);
	},

	paymentReceived: async (vendorId: string, orderId: string, amount: number) => {
		return createNotificationFromTemplateAction(
			vendorNotifications.paymentReceived(orderId, amount),
			[vendorId],
			orderId
		);
	},

	lowStock: async (vendorId: string, productName: string, currentStock: number) => {
		return createNotificationFromTemplateAction(vendorNotifications.lowStock(productName, currentStock), [
			vendorId,
		]);
	},

	productReview: async (vendorId: string, productName: string, rating: number, customerName: string) => {
		return createNotificationFromTemplateAction(
			vendorNotifications.productReview(productName, rating, customerName),
			[vendorId]
		);
	},

	// system notifications
	welcome: async (userId: string, userName: string) => {
		return createNotificationFromTemplateAction(systemNotifications.welcome(userName), [userId]);
	},

	accountVerified: async (userId: string) => {
		return createNotificationFromTemplateAction(systemNotifications.accountVerified(), [userId]);
	},

	passwordChanged: async (userId: string) => {
		return createNotificationFromTemplateAction(systemNotifications.passwordChanged(), [userId]);
	},

	maintenanceMode: async (allUserIds: string[]) => {
		return createNotificationFromTemplateAction(systemNotifications.maintenanceMode(), allUserIds);
	},

	// promotion notifications
	newOffer: async (userIds: string[], offerTitle: string, discountPercent: number) => {
		return createNotificationFromTemplateAction(
			promotionNotifications.newOffer(offerTitle, discountPercent),
			userIds
		);
	},

	flashSale: async (userIds: string[], productName: string, timeLeft: string) => {
		return createNotificationFromTemplateAction(promotionNotifications.flashSale(productName, timeLeft), userIds);
	},

	couponExpiring: async (userId: string, couponCode: string, daysLeft: number) => {
		return createNotificationFromTemplateAction(promotionNotifications.couponExpiring(couponCode, daysLeft), [
			userId,
		]);
	},
};
