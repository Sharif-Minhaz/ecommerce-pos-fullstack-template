"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { rejectOrderDelivery } from "@/app/actions/rider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface RejectOrderPageProps {
	params: {
		orderId: string;
	};
}

export default function RejectOrderPage({ params }: RejectOrderPageProps) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [rejectionReason, setRejectionReason] = useState("");

	const handleReject = async () => {
		if (!rejectionReason.trim()) {
			toast.error("Please provide a reason for rejection");
			return;
		}

		setIsLoading(true);

		try {
			const result = await rejectOrderDelivery(params.orderId, rejectionReason);

			if (result.success) {
				toast.success("Order rejected successfully");
				router.push("/rider/dashboard");
			} else {
				toast.error(result.error || "Failed to reject order");
			}
		} catch (error) {
			toast.error("An error occurred while rejecting the order");
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
					<CardTitle>Reject Order Delivery</CardTitle>
					<p className="text-muted-foreground">Please provide a reason for rejecting this order.</p>
				</CardHeader>
				<CardContent className="space-y-4">
					<div>
						<Label htmlFor="rejectionReason">Reason for Rejection *</Label>
						<Textarea
							id="rejectionReason"
							value={rejectionReason}
							onChange={(e) => setRejectionReason(e.target.value)}
							placeholder="Please explain why you cannot accept this delivery..."
							className="mt-1"
							rows={4}
							required
						/>
					</div>

					<div className="bg-red-50 border border-red-200 rounded-lg p-4">
						<h4 className="font-medium text-red-800 mb-2">Common Reasons:</h4>
						<ul className="text-sm text-red-700 space-y-1">
							<li>• Delivery address is too far from my service area</li>
							<li>• Vehicle is not in working condition</li>
							<li>• Personal emergency or unavailability</li>
							<li>• Order items are too heavy/large for my vehicle</li>
							<li>• Unsafe delivery location</li>
						</ul>
					</div>

					<div className="flex gap-3">
						<Button
							onClick={handleReject}
							disabled={isLoading || !rejectionReason.trim()}
							variant="destructive"
							className="flex-1"
						>
							{isLoading ? "Rejecting..." : "Reject Order"}
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
