// =============== email template types ================
export interface EmailTemplate {
	subject: string;
	html: string;
	text?: string;
	emailType: "order" | "rider" | "vendor" | "system" | "promotion" | "welcome" | "password_reset";
	priority: "low" | "medium" | "high";
}

// =============== base email template styles ================
const getBaseTemplate = (title: string, content: string, actionUrl?: string, actionText?: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; margin: -20px -20px 20px -20px; }
        .content { padding: 20px 0; }
        .button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; text-align: center; }
        .highlight { background-color: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>E-commerce POS</h1>
        </div>
        <div class="content">
            <h2>${title}</h2>
            ${content}
            ${actionUrl && actionText ? `<p><a href="${actionUrl}" class="button">${actionText}</a></p>` : ""}
        </div>
        <div class="footer">
            <p>Thank you for using E-commerce POS!</p>
            <p>If you have any questions, please contact our support team.</p>
        </div>
    </div>
</body>
</html>
`;

// =============== order related email templates ================
export const orderEmailTemplates = {
	orderPlaced: (orderId: string, customerName: string, totalAmount: number): EmailTemplate => ({
		subject: `Order Confirmation - #${orderId}`,
		html: getBaseTemplate(
			"Order Confirmed!",
			`
				<p>Dear ${customerName},</p>
				<p>Thank you for your order! We have received your order and it's being processed.</p>
				<div class="highlight">
					<strong>Order Details:</strong><br>
					Order ID: #${orderId}<br>
					Total Amount: $${totalAmount}<br>
					Status: Confirmed
				</div>
				<p>We will send you another email when your order ships.</p>
			`,
			"/my-orders",
			"View Order Details"
		),
		text: `Order Confirmation - #${orderId}\n\nDear ${customerName},\n\nThank you for your order! We have received your order and it's being processed.\n\nOrder Details:\nOrder ID: #${orderId}\nTotal Amount: $${totalAmount}\nStatus: Confirmed\n\nWe will send you another email when your order ships.`,
		emailType: "order",
		priority: "high",
	}),

	orderAccepted: (orderId: string, customerName: string, vendorName: string): EmailTemplate => ({
		subject: `Order Accepted - #${orderId}`,
		html: getBaseTemplate(
			"Order Accepted!",
			`
				<p>Dear ${customerName},</p>
				<p>Great news! Your order has been accepted by ${vendorName} and is being prepared for shipment.</p>
				<div class="highlight">
					<strong>Order Details:</strong><br>
					Order ID: #${orderId}<br>
					Vendor: ${vendorName}<br>
					Status: Accepted
				</div>
				<p>You will receive tracking information once your order ships.</p>
			`,
			"/my-orders",
			"View Order Details"
		),
		text: `Order Accepted - #${orderId}\n\nDear ${customerName},\n\nGreat news! Your order has been accepted by ${vendorName} and is being prepared for shipment.\n\nOrder Details:\nOrder ID: #${orderId}\nVendor: ${vendorName}\nStatus: Accepted\n\nYou will receive tracking information once your order ships.`,
		emailType: "order",
		priority: "high",
	}),

	orderShipped: (orderId: string, customerName: string, trackingNumber?: string): EmailTemplate => ({
		subject: `Order Shipped - #${orderId}`,
		html: getBaseTemplate(
			"Your Order is on the Way!",
			`
				<p>Dear ${customerName},</p>
				<p>Exciting news! Your order has been shipped and is on its way to you.</p>
				<div class="highlight">
					<strong>Shipping Details:</strong><br>
					Order ID: #${orderId}<br>
					${trackingNumber ? `Tracking Number: ${trackingNumber}<br>` : ""}
					Status: Shipped
				</div>
				<p>You can track your package using the tracking number above.</p>
			`,
			"/my-orders",
			"Track Order"
		),
		text: `Order Shipped - #${orderId}\n\nDear ${customerName},\n\nExciting news! Your order has been shipped and is on its way to you.\n\nShipping Details:\nOrder ID: #${orderId}\n${
			trackingNumber ? `Tracking Number: ${trackingNumber}\n` : ""
		}Status: Shipped\n\nYou can track your package using the tracking number above.`,
		emailType: "order",
		priority: "high",
	}),

	orderDelivered: (orderId: string, customerName: string): EmailTemplate => ({
		subject: `Order Delivered - #${orderId}`,
		html: getBaseTemplate(
			"Order Delivered Successfully!",
			`
				<p>Dear ${customerName},</p>
				<p>Your order has been delivered successfully! We hope you enjoy your purchase.</p>
				<div class="highlight">
					<strong>Delivery Details:</strong><br>
					Order ID: #${orderId}<br>
					Status: Delivered
				</div>
				<p>Thank you for choosing us! We'd love to hear about your experience.</p>
			`,
			"/my-orders",
			"View Order Details"
		),
		text: `Order Delivered - #${orderId}\n\nDear ${customerName},\n\nYour order has been delivered successfully! We hope you enjoy your purchase.\n\nDelivery Details:\nOrder ID: #${orderId}\nStatus: Delivered\n\nThank you for choosing us! We'd love to hear about your experience.`,
		emailType: "order",
		priority: "high",
	}),

	orderCancelled: (orderId: string, customerName: string, reason?: string): EmailTemplate => ({
		subject: `Order Cancelled - #${orderId}`,
		html: getBaseTemplate(
			"Order Cancelled",
			`
				<p>Dear ${customerName},</p>
				<p>We're sorry to inform you that your order has been cancelled.</p>
				<div class="highlight">
					<strong>Order Details:</strong><br>
					Order ID: #${orderId}<br>
					Status: Cancelled<br>
					${reason ? `Reason: ${reason}<br>` : ""}
				</div>
				<p>If you have any questions about this cancellation, please contact our support team.</p>
			`,
			"/my-orders",
			"View Order Details"
		),
		text: `Order Cancelled - #${orderId}\n\nDear ${customerName},\n\nWe're sorry to inform you that your order has been cancelled.\n\nOrder Details:\nOrder ID: #${orderId}\nStatus: Cancelled\n${
			reason ? `Reason: ${reason}\n` : ""
		}\nIf you have any questions about this cancellation, please contact our support team.`,
		emailType: "order",
		priority: "high",
	}),
};

// =============== rider related email templates ================
export const riderEmailTemplates = {
	riderAssigned: (orderId: string, customerName: string, riderName: string, riderPhone: string): EmailTemplate => ({
		subject: `Rider Assigned - Order #${orderId}`,
		html: getBaseTemplate(
			"Rider Assigned to Your Order",
			`
				<p>Dear ${customerName},</p>
				<p>A rider has been assigned to deliver your order.</p>
				<div class="highlight">
					<strong>Delivery Details:</strong><br>
					Order ID: #${orderId}<br>
					Rider Name: ${riderName}<br>
					Rider Phone: ${riderPhone}<br>
					Status: Rider Assigned
				</div>
				<p>You can contact the rider directly if you have any questions about your delivery.</p>
			`,
			"/my-orders",
			"View Order Details"
		),
		text: `Rider Assigned - Order #${orderId}\n\nDear ${customerName},\n\nA rider has been assigned to deliver your order.\n\nDelivery Details:\nOrder ID: #${orderId}\nRider Name: ${riderName}\nRider Phone: ${riderPhone}\nStatus: Rider Assigned\n\nYou can contact the rider directly if you have any questions about your delivery.`,
		emailType: "rider",
		priority: "high",
	}),

	riderOnTheWay: (orderId: string, customerName: string, riderName: string): EmailTemplate => ({
		subject: `Rider on the Way - Order #${orderId}`,
		html: getBaseTemplate(
			"Rider is on the Way!",
			`
				<p>Dear ${customerName},</p>
				<p>Great news! ${riderName} is on the way to deliver your order.</p>
				<div class="highlight">
					<strong>Delivery Update:</strong><br>
					Order ID: #${orderId}<br>
					Rider: ${riderName}<br>
					Status: On the Way
				</div>
				<p>Please be ready to receive your order.</p>
			`,
			"/my-orders",
			"View Order Details"
		),
		text: `Rider on the Way - Order #${orderId}\n\nDear ${customerName},\n\nGreat news! ${riderName} is on the way to deliver your order.\n\nDelivery Update:\nOrder ID: #${orderId}\nRider: ${riderName}\nStatus: On the Way\n\nPlease be ready to receive your order.`,
		emailType: "rider",
		priority: "high",
	}),

	newDeliveryRequest: (
		orderId: string,
		riderName: string,
		customerName: string,
		address: string,
		totalAmount: number
	): EmailTemplate => ({
		subject: `New Delivery Request - Order #${orderId}`,
		html: getBaseTemplate(
			"New Delivery Request",
			`
				<p>Dear ${riderName},</p>
				<p>You have a new delivery request!</p>
				<div class="highlight">
					<strong>Delivery Details:</strong><br>
					Order ID: #${orderId}<br>
					Customer: ${customerName}<br>
					Address: ${address}<br>
					Amount: $${totalAmount}
				</div>
				<p>Please accept or reject this delivery request as soon as possible.</p>
			`,
			`/rider/accept-order/${orderId}`,
			"Accept Delivery"
		),
		text: `New Delivery Request - Order #${orderId}\n\nDear ${riderName},\n\nYou have a new delivery request!\n\nDelivery Details:\nOrder ID: #${orderId}\nCustomer: ${customerName}\nAddress: ${address}\nAmount: $${totalAmount}\n\nPlease accept or reject this delivery request as soon as possible.`,
		emailType: "rider",
		priority: "high",
	}),
};

// =============== vendor related email templates ================
export const vendorEmailTemplates = {
	newOrder: (orderId: string, vendorName: string, customerName: string, totalAmount: number): EmailTemplate => ({
		subject: `New Order Received - #${orderId}`,
		html: getBaseTemplate(
			"New Order Received!",
			`
				<p>Dear ${vendorName},</p>
				<p>You have received a new order!</p>
				<div class="highlight">
					<strong>Order Details:</strong><br>
					Order ID: #${orderId}<br>
					Customer: ${customerName}<br>
					Total Amount: $${totalAmount}<br>
					Status: Pending
				</div>
				<p>Please review and accept or reject this order as soon as possible.</p>
			`,
			"/my-shop/manage-orders",
			"Manage Orders"
		),
		text: `New Order Received - #${orderId}\n\nDear ${vendorName},\n\nYou have received a new order!\n\nOrder Details:\nOrder ID: #${orderId}\nCustomer: ${customerName}\nTotal Amount: $${totalAmount}\nStatus: Pending\n\nPlease review and accept or reject this order as soon as possible.`,
		emailType: "vendor",
		priority: "high",
	}),

	paymentReceived: (orderId: string, vendorName: string, amount: number): EmailTemplate => ({
		subject: `Payment Received - Order #${orderId}`,
		html: getBaseTemplate(
			"Payment Received!",
			`
				<p>Dear ${vendorName},</p>
				<p>Payment has been received for one of your orders.</p>
				<div class="highlight">
					<strong>Payment Details:</strong><br>
					Order ID: #${orderId}<br>
					Amount: $${amount}<br>
					Status: Paid
				</div>
				<p>You can view your earnings in your vendor dashboard.</p>
			`,
			"/my-shop",
			"View Dashboard"
		),
		text: `Payment Received - Order #${orderId}\n\nDear ${vendorName},\n\nPayment has been received for one of your orders.\n\nPayment Details:\nOrder ID: #${orderId}\nAmount: $${amount}\nStatus: Paid\n\nYou can view your earnings in your vendor dashboard.`,
		emailType: "vendor",
		priority: "high",
	}),

	lowStock: (productName: string, currentStock: number): EmailTemplate => ({
		subject: `Low Stock Alert - ${productName}`,
		html: getBaseTemplate(
			"Low Stock Alert",
			`
				<p>Dear Vendor,</p>
				<p>One of your products is running low on stock.</p>
				<div class="highlight">
					<strong>Product Details:</strong><br>
					Product: ${productName}<br>
					Current Stock: ${currentStock} units<br>
					Status: Low Stock
				</div>
				<p>Please consider restocking this product to avoid running out.</p>
			`,
			"/my-shop/products",
			"Manage Products"
		),
		text: `Low Stock Alert - ${productName}\n\nDear Vendor,\n\nOne of your products is running low on stock.\n\nProduct Details:\nProduct: ${productName}\nCurrent Stock: ${currentStock} units\nStatus: Low Stock\n\nPlease consider restocking this product to avoid running out.`,
		emailType: "vendor",
		priority: "medium",
	}),
};

// =============== system email templates ================
export const systemEmailTemplates = {
	welcome: (userName: string): EmailTemplate => ({
		subject: "Welcome to E-commerce POS!",
		html: getBaseTemplate(
			"Welcome to E-commerce POS!",
			`
				<p>Dear ${userName},</p>
				<p>Welcome to E-commerce POS! We're excited to have you on board.</p>
				<div class="highlight">
					<strong>What's Next?</strong><br>
					• Browse our products<br>
					• Create your first order<br>
					• Set up your profile<br>
					• Explore our features
				</div>
				<p>If you have any questions, feel free to contact our support team.</p>
			`,
			"/products",
			"Start Shopping"
		),
		text: `Welcome to E-commerce POS!\n\nDear ${userName},\n\nWelcome to E-commerce POS! We're excited to have you on board.\n\nWhat's Next?\n• Browse our products\n• Create your first order\n• Set up your profile\n• Explore our features\n\nIf you have any questions, feel free to contact our support team.`,
		emailType: "welcome",
		priority: "medium",
	}),

	passwordReset: (userName: string, resetLink: string): EmailTemplate => ({
		subject: "Password Reset Request",
		html: getBaseTemplate(
			"Password Reset Request",
			`
				<p>Dear ${userName},</p>
				<p>We received a request to reset your password.</p>
				<div class="highlight">
					<strong>Important:</strong><br>
					This link will expire in 1 hour for security reasons.<br>
					If you didn't request this, please ignore this email.
				</div>
				<p>Click the button below to reset your password:</p>
			`,
			resetLink,
			"Reset Password"
		),
		text: `Password Reset Request\n\nDear ${userName},\n\nWe received a request to reset your password.\n\nImportant:\nThis link will expire in 1 hour for security reasons.\nIf you didn't request this, please ignore this email.\n\nClick the link below to reset your password:\n${resetLink}`,
		emailType: "password_reset",
		priority: "high",
	}),

	accountVerified: (userName: string): EmailTemplate => ({
		subject: "Account Verified Successfully",
		html: getBaseTemplate(
			"Account Verified!",
			`
				<p>Dear ${userName},</p>
				<p>Congratulations! Your account has been verified successfully.</p>
				<div class="highlight">
					<strong>Account Status:</strong><br>
					Status: Verified<br>
					Access: Full Access<br>
					Features: All Available
				</div>
				<p>You can now enjoy all the features of our platform.</p>
			`,
			"/profile",
			"View Profile"
		),
		text: `Account Verified Successfully\n\nDear ${userName},\n\nCongratulations! Your account has been verified successfully.\n\nAccount Status:\nStatus: Verified\nAccess: Full Access\nFeatures: All Available\n\nYou can now enjoy all the features of our platform.`,
		emailType: "system",
		priority: "medium",
	}),
};

// =============== promotion email templates ================
export const promotionEmailTemplates = {
	newOffer: (userName: string, offerTitle: string, discountPercent: number, validUntil: string): EmailTemplate => ({
		subject: `Special Offer: ${offerTitle} - ${discountPercent}% Off!`,
		html: getBaseTemplate(
			"Special Offer Just for You!",
			`
				<p>Dear ${userName},</p>
				<p>Don't miss out on this amazing offer!</p>
				<div class="highlight">
					<strong>Offer Details:</strong><br>
					Title: ${offerTitle}<br>
					Discount: ${discountPercent}% OFF<br>
					Valid Until: ${validUntil}<br>
					Status: Active
				</div>
				<p>Shop now and save big on your favorite products!</p>
			`,
			"/products",
			"Shop Now"
		),
		text: `Special Offer: ${offerTitle} - ${discountPercent}% Off!\n\nDear ${userName},\n\nDon't miss out on this amazing offer!\n\nOffer Details:\nTitle: ${offerTitle}\nDiscount: ${discountPercent}% OFF\nValid Until: ${validUntil}\nStatus: Active\n\nShop now and save big on your favorite products!`,
		emailType: "promotion",
		priority: "medium",
	}),

	flashSale: (userName: string, productName: string, timeLeft: string, discountPercent: number): EmailTemplate => ({
		subject: `Flash Sale: ${productName} - ${discountPercent}% Off!`,
		html: getBaseTemplate(
			"Flash Sale Alert!",
			`
				<p>Dear ${userName},</p>
				<p>Hurry! Limited time flash sale on ${productName}!</p>
				<div class="highlight">
					<strong>Flash Sale Details:</strong><br>
					Product: ${productName}<br>
					Discount: ${discountPercent}% OFF<br>
					Time Left: ${timeLeft}<br>
					Status: Limited Time
				</div>
				<p>Don't wait - this offer won't last long!</p>
			`,
			"/products",
			"Shop Now"
		),
		text: `Flash Sale: ${productName} - ${discountPercent}% Off!\n\nDear ${userName},\n\nHurry! Limited time flash sale on ${productName}!\n\nFlash Sale Details:\nProduct: ${productName}\nDiscount: ${discountPercent}% OFF\nTime Left: ${timeLeft}\nStatus: Limited Time\n\nDon't wait - this offer won't last long!`,
		emailType: "promotion",
		priority: "high",
	}),
};
