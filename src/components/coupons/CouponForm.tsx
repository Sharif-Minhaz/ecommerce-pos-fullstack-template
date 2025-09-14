"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, X, Save } from "lucide-react";
import { ICoupon } from "@/types/coupon";

interface CouponFormProps {
	coupon?: ICoupon | null;
	onSubmit: (formData: FormData) => Promise<void>;
	onCancel: () => void;
	isLoading: boolean;
}

export default function CouponForm({ coupon, onSubmit, onCancel, isLoading }: CouponFormProps) {
	const [formData, setFormData] = useState({
		name: "",
		nameBN: "",
		description: "",
		descriptionBN: "",
		code: "",
		validTill: "",
		amount: "",
		type: "flat" as "percentage" | "flat",
		minPurchase: "",
		maxDiscount: "",
	});

	// =============== populate form with existing coupon data ================
	useEffect(() => {
		if (coupon) {
			setFormData({
				name: coupon.name || "",
				nameBN: coupon.nameBN || "",
				description: coupon.description || "",
				descriptionBN: coupon.descriptionBN || "",
				code: coupon.code || "",
				validTill: coupon.validTill ? new Date(coupon.validTill).toISOString().split("T")[0] : "",
				amount: coupon.amount?.toString() || "",
				type: coupon.type || "flat",
				minPurchase: coupon.minPurchase?.toString() || "",
				maxDiscount: coupon.maxDiscount?.toString() || "",
			});
		}
	}, [coupon]);

	const handleInputChange = (field: string, value: string) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const form = new FormData();

		// =============== add all form fields to FormData ================
		Object.entries(formData).forEach(([key, value]) => {
			if (value) {
				form.append(key, value);
			}
		});

		await onSubmit(form);
	};

	return (
		<Card className="w-full max-w-2xl mx-auto">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					{coupon ? "Edit Coupon" : "Create New Coupon"}
				</CardTitle>
				<CardDescription>
					{coupon ? "Update your coupon details" : "Create a new discount coupon for your customers"}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-6">
					{/* =============== coupon name fields ================ */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="name">Coupon Name (English) *</Label>
							<Input
								id="name"
								value={formData.name}
								onChange={(e) => handleInputChange("name", e.target.value)}
								placeholder="e.g., Summer Sale"
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="nameBN">Coupon Name (Bengali) *</Label>
							<Input
								id="nameBN"
								value={formData.nameBN}
								onChange={(e) => handleInputChange("nameBN", e.target.value)}
								placeholder="e.g., গ্রীষ্মকালীন বিক্রয়"
								required
							/>
						</div>
					</div>

					{/* =============== description fields ================ */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="description">Description (English) *</Label>
							<Textarea
								id="description"
								value={formData.description}
								onChange={(e) => handleInputChange("description", e.target.value)}
								placeholder="Describe your coupon offer..."
								rows={3}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="descriptionBN">Description (Bengali) *</Label>
							<Textarea
								id="descriptionBN"
								value={formData.descriptionBN}
								onChange={(e) => handleInputChange("descriptionBN", e.target.value)}
								placeholder="আপনার কুপন অফার বর্ণনা করুন..."
								rows={3}
								required
							/>
						</div>
					</div>

					{/* =============== coupon code and validity ================ */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="code">Coupon Code *</Label>
							<Input
								id="code"
								value={formData.code}
								onChange={(e) => handleInputChange("code", e.target.value.toUpperCase())}
								placeholder="e.g., SUMMER20"
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="validTill">Valid Until *</Label>
							<Input
								id="validTill"
								type="date"
								value={formData.validTill}
								onChange={(e) => handleInputChange("validTill", e.target.value)}
								required
							/>
						</div>
					</div>

					{/* =============== discount type and amount ================ */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="type">Discount Type *</Label>
							<Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
								<SelectTrigger>
									<SelectValue placeholder="Select discount type" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="flat">Flat Amount</SelectItem>
									<SelectItem value="percentage">Percentage</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label htmlFor="amount">
								Discount Amount *{formData.type === "percentage" ? " (%)" : " (৳)"}
							</Label>
							<Input
								id="amount"
								type="number"
								value={formData.amount}
								onChange={(e) => handleInputChange("amount", e.target.value)}
								placeholder={formData.type === "percentage" ? "e.g., 20" : "e.g., 100"}
								min="0"
								max={formData.type === "percentage" ? "100" : undefined}
								required
							/>
						</div>
					</div>

					{/* =============== minimum purchase and max discount ================ */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="minPurchase">Minimum Purchase Amount (৳)</Label>
							<Input
								id="minPurchase"
								type="number"
								value={formData.minPurchase}
								onChange={(e) => handleInputChange("minPurchase", e.target.value)}
								placeholder="e.g., 500"
								min="0"
							/>
							<p className="text-sm text-muted-foreground">
								Leave empty for no minimum purchase requirement
							</p>
						</div>
						<div className="space-y-2">
							<Label htmlFor="maxDiscount">
								Maximum Discount Amount (৳)
								{formData.type === "percentage" && " *"}
							</Label>
							<Input
								id="maxDiscount"
								type="number"
								value={formData.maxDiscount}
								onChange={(e) => handleInputChange("maxDiscount", e.target.value)}
								placeholder="e.g., 200"
								min="0"
								required={formData.type === "percentage"}
							/>
							<p className="text-sm text-muted-foreground">
								{formData.type === "percentage"
									? "Required for percentage discounts"
									: "Leave empty for no maximum discount limit"}
							</p>
						</div>
					</div>

					{/* =============== form actions ================ */}
					<div className="flex justify-end gap-3 pt-4">
						<Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
							<X className="w-4 h-4 mr-2" />
							Cancel
						</Button>
						<Button type="submit" disabled={isLoading}>
							{isLoading ? (
								<Loader2 className="w-4 h-4 mr-2 animate-spin" />
							) : (
								<Save className="w-4 h-4 mr-2" />
							)}
							{coupon ? "Update Coupon" : "Create Coupon"}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
