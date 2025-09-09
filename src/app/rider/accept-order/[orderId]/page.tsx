"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { acceptOrderDelivery } from "@/app/actions/rider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface AcceptOrderPageProps {
	params: {
		orderId: string;
	};
}

export default function AcceptOrderPage({ params }: AcceptOrderPageProps) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	const handleAccept = async () => {
		setIsLoading(true);

		try {
			const result = await acceptOrderDelivery(params.orderId);

			if (result.success) {
				toast.success("Order accepted successfully!");
				router.push("/rider/dashboard");
			} else {
				toast.error(result.error || "Failed to accept order");
			}
		} catch (error) {
			toast.error("An error occurred while accepting the order");
		} finally {
			setIsLoading(false);
		}
	};

	const handleCancel = () => {
		router.push("/rider/dashboard");
	};

	return (
		<div className="container mx-auto py-8 px-4 max-w-2xl">
			<Card>
				<CardHeader>
					<CardTitle>Accept Order Delivery</CardTitle>
					<p className="text-muted-foreground">Are you sure you want to accept this order for delivery?</p>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
						<h4 className="font-medium text-yellow-800 mb-2">Important Notes:</h4>
						<ul className="text-sm text-yellow-700 space-y-1">
							<li>• Make sure you can deliver to the specified address</li>
							<li>• Check your vehicle condition before accepting</li>
							<li>• Ensure you have enough time to complete the delivery</li>
							<li>• Contact the customer if you have any questions</li>
						</ul>
					</div>

					<div className="flex gap-3">
						<Button
							onClick={handleAccept}
							disabled={isLoading}
							className="flex-1 bg-green-600 hover:bg-green-700"
						>
							{isLoading ? "Accepting..." : "Yes, Accept Order"}
						</Button>
						<Button onClick={handleCancel} variant="outline" disabled={isLoading} className="flex-1">
							Cancel
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
