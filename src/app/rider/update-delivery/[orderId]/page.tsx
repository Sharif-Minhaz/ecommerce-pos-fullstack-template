"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateDeliveryStatus } from "@/app/actions/rider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface UpdateDeliveryPageProps {
	params: {
		orderId: string;
	};
}

export default function UpdateDeliveryPage({ params }: UpdateDeliveryPageProps) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [status, setStatus] = useState("");
	const [notes, setNotes] = useState("");
	const [proof, setProof] = useState("");

	const handleUpdate = async () => {
		if (!status) {
			toast.error("Please select a delivery status");
			return;
		}

		setIsLoading(true);

		try {
			const result = await updateDeliveryStatus(
				params.orderId,
				status as "picked_up" | "delivered" | "failed",
				notes || undefined,
				proof || undefined
			);

			if (result.success) {
				toast.success("Delivery status updated successfully!");
				router.push("/rider/dashboard");
			} else {
				toast.error(result.error || "Failed to update delivery status");
			}
		} catch (error) {
			toast.error("An error occurred while updating delivery status");
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
					<CardTitle>Update Delivery Status</CardTitle>
					<p className="text-muted-foreground">Update the current status of this delivery.</p>
				</CardHeader>
				<CardContent className="space-y-4">
					<div>
						<Label htmlFor="status">Delivery Status *</Label>
						<Select value={status} onValueChange={setStatus}>
							<SelectTrigger className="mt-1">
								<SelectValue placeholder="Select delivery status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="picked_up">Picked Up</SelectItem>
								<SelectItem value="delivered">Delivered</SelectItem>
								<SelectItem value="failed">Failed</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div>
						<Label htmlFor="notes">Delivery Notes</Label>
						<Textarea
							id="notes"
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							placeholder="Add any notes about the delivery..."
							className="mt-1"
							rows={3}
						/>
					</div>

					<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
						<h4 className="font-medium text-blue-800 mb-2">Status Guidelines:</h4>
						<ul className="text-sm text-blue-700 space-y-1">
							<li>
								• <strong>Picked Up:</strong> You have collected the order from the vendor
							</li>
							<li>
								• <strong>Delivered:</strong> Order has been successfully delivered to customer
							</li>
							<li>
								• <strong>Failed:</strong> Delivery could not be completed (provide reason in notes)
							</li>
						</ul>
					</div>

					<div className="flex gap-3">
						<Button onClick={handleUpdate} disabled={isLoading || !status} className="flex-1">
							{isLoading ? "Updating..." : "Update Status"}
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
