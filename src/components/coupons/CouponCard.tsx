"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Edit3,
	Trash2,
	ToggleLeft,
	ToggleRight,
	Calendar,
	DollarSign,
	Percent,
	Copy,
	CheckCircle,
	XCircle,
} from "lucide-react";
import { ICoupon } from "@/types/coupon";
import { toast } from "sonner";

interface CouponCardProps {
	coupon: ICoupon;
	onEdit: (coupon: ICoupon) => void;
	onDelete: (couponId: string) => void;
	onToggleStatus: (couponId: string) => void;
	isDeleting: boolean;
	isToggling: boolean;
}

export default function CouponCard({
	coupon,
	onEdit,
	onDelete,
	onToggleStatus,
	isDeleting,
	isToggling,
}: CouponCardProps) {
	const isExpired = new Date(coupon.validTill) < new Date();
	const isActive = coupon.isActive && !isExpired;

	// =============== copy coupon code to clipboard ================
	const copyToClipboard = async () => {
		try {
			await navigator.clipboard.writeText(coupon.code);
			toast.success("Coupon code copied to clipboard");
		} catch (error) {
			toast.error("Failed to copy coupon code");
		}
	};

	// =============== format date ================
	const formatDate = (date: string | Date) => {
		return new Date(date).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	// =============== format discount amount ================
	const formatDiscountAmount = () => {
		if (coupon.type === "percentage") {
			return `${coupon.amount}%`;
		}
		return `৳${coupon.amount}`;
	};

	return (
		<Card className={`transition-all duration-200 hover:shadow-md ${!isActive ? "opacity-60" : ""}`}>
			<CardHeader className="pb-3">
				<div className="flex items-start justify-between">
					<div className="flex-1">
						<CardTitle className="text-lg">{coupon.name}</CardTitle>
						<CardDescription className="text-sm text-muted-foreground">{coupon.nameBN}</CardDescription>
					</div>
					<div className="flex items-center gap-2">
						<Badge variant={isActive ? "default" : "secondary"} className="flex items-center gap-1">
							{isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
							{isActive ? "Active" : isExpired ? "Expired" : "Inactive"}
						</Badge>
					</div>
				</div>
			</CardHeader>

			<CardContent className="space-y-4">
				{/* =============== coupon code ================ */}
				<div className="flex items-center gap-2">
					<code className="flex-1 bg-muted px-3 py-2 rounded-md font-mono text-sm">{coupon.code}</code>
					<Button size="sm" variant="outline" onClick={copyToClipboard} className="shrink-0">
						<Copy className="w-4 h-4" />
					</Button>
				</div>

				{/* =============== description ================ */}
				<div className="space-y-1">
					<p className="text-sm text-muted-foreground">{coupon.description}</p>
					<p className="text-sm text-muted-foreground">{coupon.descriptionBN}</p>
				</div>

				{/* =============== discount details ================ */}
				<div className="grid grid-cols-2 gap-4 text-sm">
					<div className="flex items-center gap-2">
						{coupon.type === "percentage" ? (
							<Percent className="w-4 h-4 text-muted-foreground" />
						) : (
							<DollarSign className="w-4 h-4 text-muted-foreground" />
						)}
						<span className="font-medium">{formatDiscountAmount()}</span>
					</div>
					<div className="flex items-center gap-2">
						<Calendar className="w-4 h-4 text-muted-foreground" />
						<span>Until {formatDate(coupon.validTill)}</span>
					</div>
				</div>

				{/* =============== conditions ================ */}
				{(coupon.minPurchase || coupon.maxDiscount) && (
					<div className="space-y-1 text-sm text-muted-foreground">
						{coupon.minPurchase && <p>Min. purchase: ৳{coupon.minPurchase}</p>}
						{coupon.maxDiscount && <p>Max. discount: ৳{coupon.maxDiscount}</p>}
					</div>
				)}

				{/* =============== action buttons ================ */}
				<div className="flex items-center justify-between pt-2 border-t">
					<div className="flex items-center gap-2">
						<Button
							size="sm"
							variant="outline"
							onClick={() => onToggleStatus(coupon._id)}
							disabled={isToggling}
						>
							{isToggling ? (
								<Loader2 className="w-4 h-4 animate-spin" />
							) : isActive ? (
								<ToggleRight className="w-4 h-4" />
							) : (
								<ToggleLeft className="w-4 h-4" />
							)}
							{isActive ? "Deactivate" : "Activate"}
						</Button>
					</div>
					<div className="flex items-center gap-2">
						<Button size="sm" variant="outline" onClick={() => onEdit(coupon)}>
							<Edit3 className="w-4 h-4" />
						</Button>
						<Button
							size="sm"
							variant="destructive"
							onClick={() => onDelete(coupon._id)}
							disabled={isDeleting}
						>
							{isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
