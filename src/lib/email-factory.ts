import { sendEmailFromTemplateAction } from "@/app/actions/email";
import {
	orderEmailTemplates,
	riderEmailTemplates,
	vendorEmailTemplates,
	systemEmailTemplates,
	promotionEmailTemplates,
} from "@/lib/email-templates";

// =============== email factory functions ================
export const emailFactory = {
	// order emails
	orderPlaced: async (customerEmail: string, orderId: string, customerName: string, totalAmount: number) => {
		return sendEmailFromTemplateAction(
			customerEmail,
			orderEmailTemplates.orderPlaced(orderId, customerName, totalAmount)
		);
	},

	orderAccepted: async (customerEmail: string, orderId: string, customerName: string, vendorName: string) => {
		return sendEmailFromTemplateAction(
			customerEmail,
			orderEmailTemplates.orderAccepted(orderId, customerName, vendorName)
		);
	},

	orderShipped: async (customerEmail: string, orderId: string, customerName: string, trackingNumber?: string) => {
		return sendEmailFromTemplateAction(
			customerEmail,
			orderEmailTemplates.orderShipped(orderId, customerName, trackingNumber)
		);
	},

	orderDelivered: async (customerEmail: string, orderId: string, customerName: string) => {
		return sendEmailFromTemplateAction(customerEmail, orderEmailTemplates.orderDelivered(orderId, customerName));
	},

	orderCancelled: async (customerEmail: string, orderId: string, customerName: string, reason?: string) => {
		return sendEmailFromTemplateAction(
			customerEmail,
			orderEmailTemplates.orderCancelled(orderId, customerName, reason)
		);
	},

	// rider emails
	riderAssigned: async (
		customerEmail: string,
		orderId: string,
		customerName: string,
		riderName: string,
		riderPhone: string
	) => {
		return sendEmailFromTemplateAction(
			customerEmail,
			riderEmailTemplates.riderAssigned(orderId, customerName, riderName, riderPhone)
		);
	},

	riderOnTheWay: async (customerEmail: string, orderId: string, customerName: string, riderName: string) => {
		return sendEmailFromTemplateAction(
			customerEmail,
			riderEmailTemplates.riderOnTheWay(orderId, customerName, riderName)
		);
	},

	newDeliveryRequest: async (
		riderEmail: string,
		orderId: string,
		riderName: string,
		customerName: string,
		address: string,
		totalAmount: number
	) => {
		return sendEmailFromTemplateAction(
			riderEmail,
			riderEmailTemplates.newDeliveryRequest(orderId, riderName, customerName, address, totalAmount)
		);
	},

	// vendor emails
	newOrder: async (
		vendorEmail: string,
		orderId: string,
		vendorName: string,
		customerName: string,
		totalAmount: number
	) => {
		return sendEmailFromTemplateAction(
			vendorEmail,
			vendorEmailTemplates.newOrder(orderId, vendorName, customerName, totalAmount)
		);
	},

	paymentReceived: async (vendorEmail: string, orderId: string, vendorName: string, amount: number) => {
		return sendEmailFromTemplateAction(
			vendorEmail,
			vendorEmailTemplates.paymentReceived(orderId, vendorName, amount)
		);
	},

	lowStock: async (vendorEmail: string, productName: string, currentStock: number) => {
		return sendEmailFromTemplateAction(vendorEmail, vendorEmailTemplates.lowStock(productName, currentStock));
	},

	// system emails
	welcome: async (userEmail: string, userName: string) => {
		return sendEmailFromTemplateAction(userEmail, systemEmailTemplates.welcome(userName));
	},

	passwordReset: async (userEmail: string, userName: string, resetLink: string) => {
		return sendEmailFromTemplateAction(userEmail, systemEmailTemplates.passwordReset(userName, resetLink));
	},

	accountVerified: async (userEmail: string, userName: string) => {
		return sendEmailFromTemplateAction(userEmail, systemEmailTemplates.accountVerified(userName));
	},

	// promotion emails
	newOffer: async (
		userEmail: string,
		userName: string,
		offerTitle: string,
		discountPercent: number,
		validUntil: string
	) => {
		return sendEmailFromTemplateAction(
			userEmail,
			promotionEmailTemplates.newOffer(userName, offerTitle, discountPercent, validUntil)
		);
	},

	flashSale: async (
		userEmail: string,
		userName: string,
		productName: string,
		timeLeft: string,
		discountPercent: number
	) => {
		return sendEmailFromTemplateAction(
			userEmail,
			promotionEmailTemplates.flashSale(userName, productName, timeLeft, discountPercent)
		);
	},

	// bulk promotion emails
	bulkNewOffer: async (userEmails: string[], offerTitle: string, discountPercent: number, validUntil: string) => {
		const template = promotionEmailTemplates.newOffer("Valued Customer", offerTitle, discountPercent, validUntil);
		const { sendBulkEmailsAction } = await import("@/app/actions/email");
		return sendBulkEmailsAction(userEmails, template);
	},

	bulkFlashSale: async (userEmails: string[], productName: string, timeLeft: string, discountPercent: number) => {
		const template = promotionEmailTemplates.flashSale("Valued Customer", productName, timeLeft, discountPercent);
		const { sendBulkEmailsAction } = await import("@/app/actions/email");
		return sendBulkEmailsAction(userEmails, template);
	},
};
