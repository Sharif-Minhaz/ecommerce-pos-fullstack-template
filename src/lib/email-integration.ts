// =============== email integration helper functions ================
// This file provides easy-to-use functions for integrating emails into existing features

import { emailFactory } from "./email-factory";

// =============== order related email integrations ================
export const orderEmailIntegration = {
	// send order placed email to customer
	sendOrderPlacedEmail: async (customerEmail: string, customerName: string, orderId: string, totalAmount: number) => {
		try {
			const result = await emailFactory.orderPlaced(customerEmail, orderId, customerName, totalAmount);
			if (result.success) {
				console.log(`Order placed email sent to ${customerEmail} for order ${orderId}`);
			} else {
				console.error(`Failed to send order placed email: ${result.error}`);
			}
			return result;
		} catch (error) {
			console.error("Error sending order placed email:", error);
			return { success: false, error: "Failed to send order placed email" };
		}
	},

	// send order accepted email to customer
	sendOrderAcceptedEmail: async (
		customerEmail: string,
		customerName: string,
		orderId: string,
		vendorName: string
	) => {
		try {
			const result = await emailFactory.orderAccepted(customerEmail, orderId, customerName, vendorName);
			if (result.success) {
				console.log(`Order accepted email sent to ${customerEmail} for order ${orderId}`);
			} else {
				console.error(`Failed to send order accepted email: ${result.error}`);
			}
			return result;
		} catch (error) {
			console.error("Error sending order accepted email:", error);
			return { success: false, error: "Failed to send order accepted email" };
		}
	},

	// send order shipped email to customer
	sendOrderShippedEmail: async (
		customerEmail: string,
		customerName: string,
		orderId: string,
		trackingNumber?: string
	) => {
		try {
			const result = await emailFactory.orderShipped(customerEmail, orderId, customerName, trackingNumber);
			if (result.success) {
				console.log(`Order shipped email sent to ${customerEmail} for order ${orderId}`);
			} else {
				console.error(`Failed to send order shipped email: ${result.error}`);
			}
			return result;
		} catch (error) {
			console.error("Error sending order shipped email:", error);
			return { success: false, error: "Failed to send order shipped email" };
		}
	},

	// send order delivered email to customer
	sendOrderDeliveredEmail: async (customerEmail: string, customerName: string, orderId: string) => {
		try {
			const result = await emailFactory.orderDelivered(customerEmail, orderId, customerName);
			if (result.success) {
				console.log(`Order delivered email sent to ${customerEmail} for order ${orderId}`);
			} else {
				console.error(`Failed to send order delivered email: ${result.error}`);
			}
			return result;
		} catch (error) {
			console.error("Error sending order delivered email:", error);
			return { success: false, error: "Failed to send order delivered email" };
		}
	},

	// send order cancelled email to customer
	sendOrderCancelledEmail: async (customerEmail: string, customerName: string, orderId: string, reason?: string) => {
		try {
			const result = await emailFactory.orderCancelled(customerEmail, orderId, customerName, reason);
			if (result.success) {
				console.log(`Order cancelled email sent to ${customerEmail} for order ${orderId}`);
			} else {
				console.error(`Failed to send order cancelled email: ${result.error}`);
			}
			return result;
		} catch (error) {
			console.error("Error sending order cancelled email:", error);
			return { success: false, error: "Failed to send order cancelled email" };
		}
	},
};

// =============== rider related email integrations ================
export const riderEmailIntegration = {
	// send rider assigned email to customer
	sendRiderAssignedEmail: async (
		customerEmail: string,
		customerName: string,
		orderId: string,
		riderName: string,
		riderPhone: string
	) => {
		try {
			const result = await emailFactory.riderAssigned(
				customerEmail,
				orderId,
				customerName,
				riderName,
				riderPhone
			);
			if (result.success) {
				console.log(`Rider assigned email sent to ${customerEmail} for order ${orderId}`);
			} else {
				console.error(`Failed to send rider assigned email: ${result.error}`);
			}
			return result;
		} catch (error) {
			console.error("Error sending rider assigned email:", error);
			return { success: false, error: "Failed to send rider assigned email" };
		}
	},

	// send rider on the way email to customer
	sendRiderOnTheWayEmail: async (customerEmail: string, customerName: string, orderId: string, riderName: string) => {
		try {
			const result = await emailFactory.riderOnTheWay(customerEmail, orderId, customerName, riderName);
			if (result.success) {
				console.log(`Rider on the way email sent to ${customerEmail} for order ${orderId}`);
			} else {
				console.error(`Failed to send rider on the way email: ${result.error}`);
			}
			return result;
		} catch (error) {
			console.error("Error sending rider on the way email:", error);
			return { success: false, error: "Failed to send rider on the way email" };
		}
	},

	// send new delivery request email to rider
	sendNewDeliveryRequestEmail: async (
		riderEmail: string,
		orderId: string,
		riderName: string,
		customerName: string,
		address: string,
		totalAmount: number
	) => {
		try {
			const result = await emailFactory.newDeliveryRequest(
				riderEmail,
				orderId,
				riderName,
				customerName,
				address,
				totalAmount
			);
			if (result.success) {
				console.log(`New delivery request email sent to ${riderEmail} for order ${orderId}`);
			} else {
				console.error(`Failed to send new delivery request email: ${result.error}`);
			}
			return result;
		} catch (error) {
			console.error("Error sending new delivery request email:", error);
			return { success: false, error: "Failed to send new delivery request email" };
		}
	},
};

// =============== vendor related email integrations ================
export const vendorEmailIntegration = {
	// send new order email to vendor
	sendNewOrderEmail: async (
		vendorEmail: string,
		orderId: string,
		vendorName: string,
		customerName: string,
		totalAmount: number
	) => {
		try {
			const result = await emailFactory.newOrder(vendorEmail, orderId, vendorName, customerName, totalAmount);
			if (result.success) {
				console.log(`New order email sent to ${vendorEmail} for order ${orderId}`);
			} else {
				console.error(`Failed to send new order email: ${result.error}`);
			}
			return result;
		} catch (error) {
			console.error("Error sending new order email:", error);
			return { success: false, error: "Failed to send new order email" };
		}
	},

	// send payment received email to vendor
	sendPaymentReceivedEmail: async (vendorEmail: string, orderId: string, vendorName: string, amount: number) => {
		try {
			const result = await emailFactory.paymentReceived(vendorEmail, orderId, vendorName, amount);
			if (result.success) {
				console.log(`Payment received email sent to ${vendorEmail} for order ${orderId}`);
			} else {
				console.error(`Failed to send payment received email: ${result.error}`);
			}
			return result;
		} catch (error) {
			console.error("Error sending payment received email:", error);
			return { success: false, error: "Failed to send payment received email" };
		}
	},

	// send low stock alert email to vendor
	sendLowStockEmail: async (vendorEmail: string, productName: string, currentStock: number) => {
		try {
			const result = await emailFactory.lowStock(vendorEmail, productName, currentStock);
			if (result.success) {
				console.log(`Low stock email sent to ${vendorEmail} for product ${productName}`);
			} else {
				console.error(`Failed to send low stock email: ${result.error}`);
			}
			return result;
		} catch (error) {
			console.error("Error sending low stock email:", error);
			return { success: false, error: "Failed to send low stock email" };
		}
	},
};

// =============== system related email integrations ================
export const systemEmailIntegration = {
	// send welcome email to new user
	sendWelcomeEmail: async (userEmail: string, userName: string) => {
		try {
			const result = await emailFactory.welcome(userEmail, userName);
			if (result.success) {
				console.log(`Welcome email sent to ${userEmail}`);
			} else {
				console.error(`Failed to send welcome email: ${result.error}`);
			}
			return result;
		} catch (error) {
			console.error("Error sending welcome email:", error);
			return { success: false, error: "Failed to send welcome email" };
		}
	},

	// send password reset email
	sendPasswordResetEmail: async (userEmail: string, userName: string, resetLink: string) => {
		try {
			const result = await emailFactory.passwordReset(userEmail, userName, resetLink);
			if (result.success) {
				console.log(`Password reset email sent to ${userEmail}`);
			} else {
				console.error(`Failed to send password reset email: ${result.error}`);
			}
			return result;
		} catch (error) {
			console.error("Error sending password reset email:", error);
			return { success: false, error: "Failed to send password reset email" };
		}
	},

	// send account verified email
	sendAccountVerifiedEmail: async (userEmail: string, userName: string) => {
		try {
			const result = await emailFactory.accountVerified(userEmail, userName);
			if (result.success) {
				console.log(`Account verified email sent to ${userEmail}`);
			} else {
				console.error(`Failed to send account verified email: ${result.error}`);
			}
			return result;
		} catch (error) {
			console.error("Error sending account verified email:", error);
			return { success: false, error: "Failed to send account verified email" };
		}
	},
};

// =============== promotion related email integrations ================
export const promotionEmailIntegration = {
	// send promotion email to single user
	sendPromotionEmail: async (
		userEmail: string,
		userName: string,
		offerTitle: string,
		discountPercent: number,
		validUntil: string
	) => {
		try {
			const result = await emailFactory.newOffer(userEmail, userName, offerTitle, discountPercent, validUntil);
			if (result.success) {
				console.log(`Promotion email sent to ${userEmail}`);
			} else {
				console.error(`Failed to send promotion email: ${result.error}`);
			}
			return result;
		} catch (error) {
			console.error("Error sending promotion email:", error);
			return { success: false, error: "Failed to send promotion email" };
		}
	},

	// send flash sale email to single user
	sendFlashSaleEmail: async (
		userEmail: string,
		userName: string,
		productName: string,
		timeLeft: string,
		discountPercent: number
	) => {
		try {
			const result = await emailFactory.flashSale(userEmail, userName, productName, timeLeft, discountPercent);
			if (result.success) {
				console.log(`Flash sale email sent to ${userEmail}`);
			} else {
				console.error(`Failed to send flash sale email: ${result.error}`);
			}
			return result;
		} catch (error) {
			console.error("Error sending flash sale email:", error);
			return { success: false, error: "Failed to send flash sale email" };
		}
	},

	// send bulk promotion email to multiple users
	sendBulkPromotionEmail: async (
		userEmails: string[],
		offerTitle: string,
		discountPercent: number,
		validUntil: string
	) => {
		try {
			const result = await emailFactory.bulkNewOffer(userEmails, offerTitle, discountPercent, validUntil);
			if (result.success) {
				console.log(`Bulk promotion email sent to ${userEmails.length} users`);
			} else {
				console.error(`Failed to send bulk promotion email`);
			}
			return result;
		} catch (error) {
			console.error("Error sending bulk promotion email:", error);
			return { success: false, error: "Failed to send bulk promotion email" };
		}
	},
};
