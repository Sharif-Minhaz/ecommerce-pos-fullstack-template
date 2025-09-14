"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
	sendEmail,
	sendEmailFromTemplate,
	sendBulkEmails,
	verifyEmailConfiguration,
	sendTestEmail,
} from "@/lib/email-service";
import { EmailTemplate } from "@/lib/email-templates";

// =============== get user session helper ================
async function getCurrentUser() {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) {
		throw new Error("User not authenticated");
	}
	return session.user;
}

// =============== send custom email ================
export async function sendCustomEmail(
	to: string,
	subject: string,
	html: string,
	text?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
	try {
		const user = await getCurrentUser();

		const result = await sendEmail({
			to,
			subject,
			html,
			text,
		});

		return result;
	} catch (error) {
		console.error("Error sending custom email:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Failed to send email",
		};
	}
}

// =============== send email from template ================
export async function sendEmailFromTemplateAction(
	to: string,
	template: EmailTemplate
): Promise<{ success: boolean; messageId?: string; error?: string }> {
	try {
		const user = await getCurrentUser();

		const result = await sendEmailFromTemplate(to, template);
		return result;
	} catch (error) {
		console.error("Error sending email from template:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Failed to send email",
		};
	}
}

// =============== send bulk emails ================
export async function sendBulkEmailsAction(
	recipients: string[],
	template: EmailTemplate
): Promise<{
	success: boolean;
	results: Array<{ email: string; success: boolean; messageId?: string; error?: string }>;
}> {
	try {
		const user = await getCurrentUser();

		const result = await sendBulkEmails(recipients, template);
		return result;
	} catch (error) {
		console.error("Error sending bulk emails:", error);
		return {
			success: false,
			results: recipients.map((email) => ({
				email,
				success: false,
				error: error instanceof Error ? error.message : "Failed to send email",
			})),
		};
	}
}

// =============== verify email configuration ================
export async function verifyEmailConfig(): Promise<{ success: boolean; error?: string }> {
	try {
		const result = await verifyEmailConfiguration();
		return result;
	} catch (error) {
		console.error("Error verifying email configuration:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Failed to verify email configuration",
		};
	}
}

// =============== send test email ================
export async function sendTestEmailAction(
	to: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
	try {
		const user = await getCurrentUser();

		const result = await sendTestEmail(to);
		return result;
	} catch (error) {
		console.error("Error sending test email:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Failed to send test email",
		};
	}
}
