"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { emailFactory } from "@/lib/email-factory";
import { verifyEmailConfig, sendTestEmailAction } from "@/app/actions/email";

export default function TestEmailsPage() {
	const { data: session } = useSession();
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState("");
	const [testEmail, setTestEmail] = useState("");

	// =============== test email functions ================
	const testEmailConfig = async () => {
		setLoading(true);
		try {
			const result = await verifyEmailConfig();
			if (result.success) {
				setMessage("✅ Email configuration is working correctly!");
			} else {
				setMessage(`❌ Email configuration error: ${result.error}`);
			}
		} catch {
			setMessage("❌ Error testing email configuration");
		} finally {
			setLoading(false);
		}
	};

	const sendTestEmail = async () => {
		if (!testEmail) {
			setMessage("❌ Please enter an email address");
			return;
		}

		setLoading(true);
		try {
			const result = await sendTestEmailAction(testEmail);
			if (result.success) {
				setMessage(`✅ Test email sent successfully to ${testEmail}! Message ID: ${result.messageId}`);
			} else {
				setMessage(`❌ Failed to send test email: ${result.error}`);
			}
		} catch {
			setMessage("❌ Error sending test email");
		} finally {
			setLoading(false);
		}
	};

	const testOrderPlacedEmail = async () => {
		if (!testEmail) {
			setMessage("❌ Please enter an email address");
			return;
		}

		setLoading(true);
		try {
			const result = await emailFactory.orderPlaced(testEmail, "TEST-001", "Test Customer", 99.99);
			if (result.success) {
				setMessage(`✅ Order placed email sent to ${testEmail}!`);
			} else {
				setMessage(`❌ Failed to send order placed email: ${result.error}`);
			}
		} catch {
			setMessage("❌ Error sending order placed email");
		} finally {
			setLoading(false);
		}
	};

	const testRiderAssignedEmail = async () => {
		if (!testEmail) {
			setMessage("❌ Please enter an email address");
			return;
		}

		setLoading(true);
		try {
			const result = await emailFactory.riderAssigned(
				testEmail,
				"TEST-001",
				"Test Customer",
				"John Rider",
				"+1234567890"
			);
			if (result.success) {
				setMessage(`✅ Rider assigned email sent to ${testEmail}!`);
			} else {
				setMessage(`❌ Failed to send rider assigned email: ${result.error}`);
			}
		} catch {
			setMessage("❌ Error sending rider assigned email");
		} finally {
			setLoading(false);
		}
	};

	const testVendorNewOrderEmail = async () => {
		if (!testEmail) {
			setMessage("❌ Please enter an email address");
			return;
		}

		setLoading(true);
		try {
			const result = await emailFactory.newOrder(testEmail, "TEST-001", "Test Vendor", "Test Customer", 99.99);
			if (result.success) {
				setMessage(`✅ New order email sent to ${testEmail}!`);
			} else {
				setMessage(`❌ Failed to send new order email: ${result.error}`);
			}
		} catch {
			setMessage("❌ Error sending new order email");
		} finally {
			setLoading(false);
		}
	};

	const testWelcomeEmail = async () => {
		if (!testEmail) {
			setMessage("❌ Please enter an email address");
			return;
		}

		setLoading(true);
		try {
			const result = await emailFactory.welcome(testEmail, "Test User");
			if (result.success) {
				setMessage(`✅ Welcome email sent to ${testEmail}!`);
			} else {
				setMessage(`❌ Failed to send welcome email: ${result.error}`);
			}
		} catch {
			setMessage("❌ Error sending welcome email");
		} finally {
			setLoading(false);
		}
	};

	const testPromotionEmail = async () => {
		if (!testEmail) {
			setMessage("❌ Please enter an email address");
			return;
		}

		setLoading(true);
		try {
			const result = await emailFactory.newOffer(testEmail, "Test User", "Black Friday Sale", 50, "2024-12-31");
			if (result.success) {
				setMessage(`✅ Promotion email sent to ${testEmail}!`);
			} else {
				setMessage(`❌ Failed to send promotion email: ${result.error}`);
			}
		} catch {
			setMessage("❌ Error sending promotion email");
		} finally {
			setLoading(false);
		}
	};

	if (!session) {
		return (
			<div className="container mx-auto p-8">
				<Card>
					<CardHeader>
						<CardTitle>Test Email System</CardTitle>
						<CardDescription>Please log in to test the email system</CardDescription>
					</CardHeader>
				</Card>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-8 space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Test Email System</CardTitle>
					<CardDescription>
						Test the email system by sending different types of emails. Make sure your email configuration
						is set up correctly in the environment variables.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="test-email">Test Email Address</Label>
						<Input
							id="test-email"
							type="email"
							placeholder="Enter email address to test"
							value={testEmail}
							onChange={(e) => setTestEmail(e.target.value)}
						/>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<Button onClick={testEmailConfig} disabled={loading} className="h-16">
							Test Email Configuration
						</Button>

						<Button onClick={sendTestEmail} disabled={loading || !testEmail} className="h-16">
							Send Test Email
						</Button>

						<Button onClick={testOrderPlacedEmail} disabled={loading || !testEmail} className="h-16">
							Test Order Placed Email
						</Button>

						<Button onClick={testRiderAssignedEmail} disabled={loading || !testEmail} className="h-16">
							Test Rider Assigned Email
						</Button>

						<Button onClick={testVendorNewOrderEmail} disabled={loading || !testEmail} className="h-16">
							Test Vendor New Order Email
						</Button>

						<Button onClick={testWelcomeEmail} disabled={loading || !testEmail} className="h-16">
							Test Welcome Email
						</Button>

						<Button onClick={testPromotionEmail} disabled={loading || !testEmail} className="h-16">
							Test Promotion Email
						</Button>
					</div>

					{message && (
						<div
							className={`p-4 rounded-md ${
								message.includes("✅")
									? "bg-green-100 border border-green-400 text-green-800"
									: "bg-red-100 border border-red-400 text-red-800"
							}`}
						>
							{message}
						</div>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Email Templates Available</CardTitle>
					<CardDescription>Here are all the email templates you can use in your application</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<h3 className="font-semibold mb-2">Order Emails</h3>
							<ul className="space-y-1 text-sm text-muted-foreground">
								<li>• Order Placed</li>
								<li>• Order Accepted</li>
								<li>• Order Shipped</li>
								<li>• Order Delivered</li>
								<li>• Order Cancelled</li>
							</ul>
						</div>
						<div>
							<h3 className="font-semibold mb-2">Rider Emails</h3>
							<ul className="space-y-1 text-sm text-muted-foreground">
								<li>• Rider Assigned</li>
								<li>• Rider On The Way</li>
								<li>• New Delivery Request</li>
							</ul>
						</div>
						<div>
							<h3 className="font-semibold mb-2">Vendor Emails</h3>
							<ul className="space-y-1 text-sm text-muted-foreground">
								<li>• New Order</li>
								<li>• Payment Received</li>
								<li>• Low Stock Alert</li>
							</ul>
						</div>
						<div>
							<h3 className="font-semibold mb-2">System Emails</h3>
							<ul className="space-y-1 text-sm text-muted-foreground">
								<li>• Welcome</li>
								<li>• Password Reset</li>
								<li>• Account Verified</li>
								<li>• Promotions</li>
							</ul>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
