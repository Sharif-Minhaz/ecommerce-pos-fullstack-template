"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useCart } from "@/hooks/useCart";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import Image from "next/image";
import { validateCoupon } from "@/app/actions/coupon";

export default function CartPage() {
	const { data: session } = useSession();
	const { cart, updateQuantity, removeFromCart, subtotal, totalItems, isMounted } = useCart();
	const [coupon, setCoupon] = useState("");
	const [couponApplied, setCouponApplied] = useState(false);
	const [discount, setDiscount] = useState(0);
	const [couponData, setCouponData] = useState<{ _id: string; code: string; name: string } | null>(null);
	const [vendorTotal, setVendorTotal] = useState(0);
	const [applicableItems, setApplicableItems] = useState(0);
	const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
	const deliveryCharge = subtotal >= 300 ? 0 : 20;

	// =============== handle coupon apply ================
	const handleApplyCoupon = async () => {
		if (!coupon.trim()) {
			toast.error("Please enter a coupon code");
			return;
		}

		try {
			setIsValidatingCoupon(true);
			const result = await validateCoupon(coupon, cart, session?.user?.id);

			if (result.success) {
				setDiscount(result.discountAmount || 0);
				setCouponData(result.coupon);
				setVendorTotal(result.vendorTotal || 0);
				setApplicableItems(result.applicableItems || 0);
				setCouponApplied(true);
				toast.success(`Coupon applied! You saved ৳${result.discountAmount || 0}`);
			} else {
				setDiscount(0);
				setCouponData(null);
				setVendorTotal(0);
				setApplicableItems(0);
				setCouponApplied(false);
				toast.error(result.error || "Invalid coupon code");
			}
		} catch (error) {
			console.error("Error validating coupon:", error);
			toast.error("An error occurred while validating the coupon");
		} finally {
			setIsValidatingCoupon(false);
		}
	};

	// =============== handle coupon remove ================
	const handleRemoveCoupon = () => {
		setCoupon("");
		setDiscount(0);
		setCouponData(null);
		setVendorTotal(0);
		setApplicableItems(0);
		setCouponApplied(false);
		toast.success("Coupon removed");
	};

	// =============== calculate total ================
	const total = subtotal + deliveryCharge - discount;

	// =============== show loading state during hydration ================
	if (!isMounted) {
		return (
			<div className="container mx-auto py-8 px-2 max-w-7xl">
				<div className="flex flex-col lg:flex-row gap-8">
					<div className="flex-1">
						<h2 className="text-xl font-bold mb-4">Cart</h2>
						<div className="text-gray-500">Loading cart...</div>
					</div>
					<div className="w-full lg:w-[350px] flex-shrink-0">
						<Card className="p-6 sticky top-6">
							<h3 className="text-lg font-bold mb-2">Cart Summary</h3>
							<div className="text-gray-500">Loading...</div>
						</Card>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto py-8 px-2 max-w-7xl">
			<div className="flex flex-col lg:flex-row gap-8">
				{/* =============== cart items list =============== */}
				<div className="flex-1">
					<h2 className="text-xl font-bold mb-4">Cart</h2>
					{cart.length === 0 ? (
						<div className="text-gray-500">Your cart is empty.</div>
					) : (
						<div className="flex flex-col gap-6">
							{cart.map((item) => (
								<Card
									key={String(item.product._id)}
									className="flex flex-col md:flex-row items-center gap-4 p-4"
								>
									{/* =============== product image =============== */}
									<div className="w-24 h-24 relative flex-shrink-0">
										<Image
											src={
												(item.product.gallery[0] as any)?.url ||
												(item.product.gallery[0] as any)
											}
											alt={item.product.title}
											fill
											sizes="96px"
											style={{ objectFit: "contain" }}
											className="rounded"
										/>
									</div>
									{/* =============== product info =============== */}
									<div className="flex-1 flex flex-col gap-1 min-w-0">
										<div className="font-semibold truncate">{item.product.title}</div>
										<div className="text-xs text-muted-foreground">
											Lat Price: <span className="line-through">BDT{item.product.price}</span>
										</div>
									</div>
									{/* =============== quantity selector =============== */}
									<div className="flex items-center gap-2">
										<Select
											value={String(item.quantity)}
											onValueChange={(val) =>
												updateQuantity(String(item.product._id), Number(val))
											}
										>
											<SelectTrigger className="w-14" size="sm">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{[...Array(Math.min(10, item.product.stock)).keys()].map((i) => (
													<SelectItem key={String(i + 1)} value={String(i + 1)}>
														{i + 1}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										{/* =============== remove button =============== */}
										<Button
											variant="ghost"
											size="icon"
											onClick={() => removeFromCart(String(item.product._id))}
											aria-label="Remove"
										>
											🗑️
										</Button>
									</div>
									{/* =============== price =============== */}
									<div className="flex flex-col items-end min-w-[100px]">
										<span className="font-semibold">
											BDT {(item.product.salePrice ?? item.product.price).toFixed(2)}
										</span>
										<span className="text-xs text-muted-foreground">
											BDT{" "}
											{((item.product.salePrice ?? item.product.price) * item.quantity).toFixed(
												2
											)}
										</span>
									</div>
								</Card>
							))}
						</div>
					)}
				</div>
				{/* =============== cart summary =============== */}
				<div className="w-full lg:w-[350px] flex-shrink-0">
					<Card className="p-6 sticky top-6">
						<h3 className="text-lg font-bold mb-2">Cart Summary</h3>
						<div className="text-green-600 text-sm mb-1">Free Delivery</div>
						<div className="flex items-center gap-2 mb-4">
							<Input
								placeholder="Enter your coupon code"
								value={coupon}
								onChange={(e) => setCoupon(e.target.value)}
								className="flex-1"
								disabled={couponApplied}
							/>
							{couponApplied ? (
								<Button onClick={handleRemoveCoupon} size="sm" variant="outline">
									Remove
								</Button>
							) : (
								<Button
									onClick={handleApplyCoupon}
									size="sm"
									disabled={isValidatingCoupon || !coupon.trim()}
								>
									{isValidatingCoupon ? "Validating..." : "Apply"}
								</Button>
							)}
						</div>
						{couponApplied && couponData && (
							<div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
								<div className="text-green-800 text-sm font-medium mb-1">
									✓ Coupon Applied: {couponData.code}
								</div>
								<div className="text-green-700 text-xs">
									{couponData.name} - Applied to {applicableItems} item(s) from this vendor
								</div>
								<div className="text-green-700 text-xs">
									Vendor total: ৳{vendorTotal} | Discount: ৳{discount}
								</div>
							</div>
						)}
						<div className="flex flex-col gap-2 text-sm mb-4">
							<div className="flex justify-between">
								<span>Subtotal ({totalItems} items)</span>
								<span>BDT {subtotal.toFixed(2)}</span>
							</div>
							<div className="flex justify-between">
								<span>Delivery charge</span>
								<span>BDT {deliveryCharge === 0 ? "Free" : deliveryCharge.toFixed(2)}</span>
							</div>
							{discount > 0 && (
								<div className="flex justify-between text-green-600">
									<span>Coupon Discount ({couponData?.code})</span>
									<span>- ৳{discount.toFixed(2)}</span>
								</div>
							)}
						</div>
						<div className="flex justify-between font-bold text-lg mb-4">
							<span>Total</span>
							<span>BDT {total.toFixed(2)}</span>
						</div>
						<Button
							className="w-full"
							size="lg"
							disabled={cart.length === 0}
							onClick={() => {
								if (couponApplied && couponData) {
									const couponInfo = encodeURIComponent(JSON.stringify(couponData));
									window.location.href = `/checkout?coupon=${couponData.code}&discount=${discount}&couponInfo=${couponInfo}`;
								} else {
									window.location.href = "/checkout";
								}
							}}
						>
							Proceed to Checkout
						</Button>
					</Card>
				</div>
			</div>
		</div>
	);
}
