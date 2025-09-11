"use client";

import React, { useState } from "react";
import { useCart } from "@/hooks/useCart";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import Image from "next/image";
import Link from "next/link";

export default function CartPage() {
	const { cart, updateQuantity, removeFromCart, subtotal, totalItems, isMounted } = useCart();
	const [coupon, setCoupon] = useState("");
	const [couponApplied, setCouponApplied] = useState(false);
	const [discount, setDiscount] = useState(0);
	const deliveryCharge = subtotal >= 300 ? 0 : 20;

	// =============== handle coupon apply ================
	const handleApplyCoupon = () => {
		// =============== fake coupon logic ================
		if (coupon === "FREE20") {
			setDiscount(20);
			setCouponApplied(true);
		} else {
			setDiscount(0);
			setCouponApplied(false);
		}
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
											src={item.product.gallery[0]}
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
							/>
							<Button onClick={handleApplyCoupon} size="sm">
								Apply
							</Button>
						</div>
						{couponApplied && <div className="text-green-600 text-xs mb-2">Coupon applied! -BDT20</div>}
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
								<div className="flex justify-between text-red-500">
									<span>You saved</span>
									<span>- BDT {discount.toFixed(2)}</span>
								</div>
							)}
						</div>
						<div className="flex justify-between font-bold text-lg mb-4">
							<span>Total</span>
							<span>BDT {total.toFixed(2)}</span>
						</div>
						<Button className="w-full" size="lg" disabled={cart.length === 0} asChild>
							<Link href="/checkout">Proceed to Checkout</Link>
						</Button>
					</Card>
				</div>
			</div>
		</div>
	);
}
