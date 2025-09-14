import { createTransporter, emailConfig } from "./email-config";
import { EmailTemplate } from "./email-templates";

// =============== email service interface ================
export interface EmailOptions {
	to: string;
	from?: string;
	subject: string;
	html: string;
	text?: string;
}

// =============== send email function ================
export async function sendEmail(
	options: EmailOptions
): Promise<{ success: boolean; messageId?: string; error?: string }> {
	try {
		const transporter = createTransporter();

		const mailOptions = {
			from: options.from || emailConfig.from,
			to: options.to,
			subject: options.subject,
			html: options.html,
			text: options.text,
		};

		const result = await transporter.sendMail(mailOptions);

		console.log("Email sent successfully:", result.messageId);
		return {
			success: true,
			messageId: result.messageId,
		};
	} catch (error) {
		console.error("Error sending email:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error occurred",
		};
	}
}

// =============== send email from template ================
export async function sendEmailFromTemplate(
	to: string,
	template: EmailTemplate,
	from?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
	try {
		const emailOptions: EmailOptions = {
			to,
			from,
			subject: template.subject,
			html: template.html,
			text: template.text,
		};

		return await sendEmail(emailOptions);
	} catch (error) {
		console.error("Error sending email from template:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error occurred",
		};
	}
}

// =============== send bulk emails ================
export async function sendBulkEmails(
	recipients: string[],
	template: EmailTemplate,
	from?: string
): Promise<{
	success: boolean;
	results: Array<{ email: string; success: boolean; messageId?: string; error?: string }>;
}> {
	const results = [];

	for (const email of recipients) {
		const result = await sendEmailFromTemplate(email, template, from);
		results.push({
			email,
			success: result.success,
			messageId: result.messageId,
			error: result.error,
		});
	}

	const successCount = results.filter((r) => r.success).length;

	return {
		success: successCount > 0,
		results,
	};
}

// =============== verify email configuration ================
export async function verifyEmailConfiguration(): Promise<{ success: boolean; error?: string }> {
	try {
		const transporter = createTransporter();
		await transporter.verify();
		return { success: true };
	} catch (error) {
		console.error("Email configuration verification failed:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Email configuration verification failed",
		};
	}
}

// =============== test email function ================
export async function sendTestEmail(to: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
	const testTemplate: EmailTemplate = {
		subject: "Test Email - E-commerce POS",
		html: `
			<!DOCTYPE html>
			<html>
			<head>
				<meta charset="utf-8">
				<title>Test Email</title>
				<style>
					body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4; }
					.container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
					.header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; margin: -20px -20px 20px -20px; }
					.content { padding: 20px 0; }
					.success { background-color: #d1fae5; padding: 15px; border-radius: 6px; border-left: 4px solid #10b981; margin: 15px 0; }
				</style>
			</head>
			<body>
				<div class="container">
					<div class="header">
						<h1>E-commerce POS</h1>
					</div>
					<div class="content">
						<h2>Test Email</h2>
						<div class="success">
							<strong>✅ Email System Working!</strong><br>
							This is a test email to verify that the email system is working correctly.
						</div>
						<p>If you received this email, the email configuration is working properly.</p>
						<p><strong>Test Details:</strong></p>
						<ul>
							<li>Sent at: ${new Date().toLocaleString()}</li>
							<li>Recipient: ${to}</li>
							<li>Status: Success</li>
						</ul>
					</div>
				</div>
			</body>
			</html>
		`,
		text: `Test Email - E-commerce POS\n\nThis is a test email to verify that the email system is working correctly.\n\nIf you received this email, the email configuration is working properly.\n\nTest Details:\nSent at: ${new Date().toLocaleString()}\nRecipient: ${to}\nStatus: Success`,
		emailType: "system",
		priority: "low",
	};

	return await sendEmailFromTemplate(to, testTemplate);
}
