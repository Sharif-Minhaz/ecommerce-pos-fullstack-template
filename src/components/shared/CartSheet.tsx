"use client";

import React, { useState } from "react";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { ShoppingCart, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function CartSheet() {
	const { cart, removeFromCart, subtotal, totalItems, isMounted } = useCart();
	const [isOpen, setIsOpen] = useState(false);

	// =============== show loading state during hydration ================
	if (!isMounted) {
		return (
			<Sheet open={isOpen} onOpenChange={setIsOpen}>
				<SheetTrigger asChild>
					<Button variant="ghost" size="icon" className="relative">
						<ShoppingCart className="h-5 w-5" />
					</Button>
				</SheetTrigger>
				<SheetContent side="right" className="w-[400px] sm:w-[540px]">
					<SheetHeader>
						<SheetTitle>Cart</SheetTitle>
					</SheetHeader>
					<div className="flex items-center justify-center h-32">
						<div className="text-gray-500">Loading cart...</div>
					</div>
				</SheetContent>
			</Sheet>
		);
	}

	return (
		<Sheet open={isOpen} onOpenChange={setIsOpen}>
			<SheetTrigger asChild>
				<Button variant="ghost" size="icon" className="relative">
					<ShoppingCart className="h-5 w-5" />
					{totalItems > 0 && (
						<span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
							{totalItems > 99 ? "99+" : totalItems}
						</span>
					)}
				</Button>
			</SheetTrigger>
			<SheetContent side="right" className="w-[400px] sm:w-[540px] flex flex-col">
				<SheetHeader>
					<SheetTitle>Cart ({totalItems} items)</SheetTitle>
				</SheetHeader>

				{/* =============== cart items =============== */}
				<div className="flex-1 overflow-y-auto py-4">
					{cart.length === 0 ? (
						<div className="flex flex-col items-center justify-center h-full text-center">
							<ShoppingCart className="h-16 w-16 text-gray-300 mb-4" />
							<h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
							<p className="text-gray-500 mb-4">Add some products to get started</p>
							<Link href="/products">
								<Button onClick={() => setIsOpen(false)}>Browse Products</Button>
							</Link>
						</div>
					) : (
						<div className="space-y-4">
							{cart.slice(0, 5).map((item) => (
								<div
									key={String(item.product._id)}
									className="flex items-center gap-3 p-3 border rounded-lg"
								>
									{/* =============== product image =============== */}
									<div className="w-16 h-16 relative flex-shrink-0">
										<Image
											src={
												(item.product.gallery[0] as any)?.url ||
												(item.product.gallery[0] as any)
											}
											alt={item.product.title}
											fill
											sizes="64px"
											style={{ objectFit: "contain" }}
											className="rounded"
										/>
									</div>

									{/* =============== product info =============== */}
									<div className="flex-1 min-w-0">
										<h4 className="font-medium text-sm truncate">{item.product.title}</h4>
										<p className="text-sm text-gray-500">Qty: {item.quantity}</p>
										<p className="text-sm font-semibold">
											SAR{" "}
											{((item.product.salePrice ?? item.product.price) * item.quantity).toFixed(
												2
											)}
										</p>
									</div>

									{/* =============== remove button =============== */}
									<Button
										variant="ghost"
										size="icon"
										onClick={() => removeFromCart(String(item.product._id))}
										className="h-8 w-8"
									>
										<X className="h-4 w-4" />
									</Button>
								</div>
							))}

							{/* =============== show more indicator =============== */}
							{cart.length > 5 && (
								<div className="text-center text-sm text-gray-500 py-2">
									+{cart.length - 5} more items
								</div>
							)}
						</div>
					)}
				</div>

				{/* =============== cart summary and actions =============== */}
				{cart.length > 0 && (
					<SheetFooter className="border-t pt-4">
						<div className="w-full space-y-4">
							<div className="flex justify-between items-center">
								<span className="font-semibold">Subtotal:</span>
								<span className="font-semibold">SAR {subtotal.toFixed(2)}</span>
							</div>
							<div className="flex gap-2">
								<Link href="/cart" className="flex-1">
									<Button className="w-full" variant="outline" onClick={() => setIsOpen(false)}>
										View Details
									</Button>
								</Link>
								<Link href="/checkout" className="flex-1">
									<Button className="w-full" onClick={() => setIsOpen(false)}>
										Checkout
									</Button>
								</Link>
							</div>
						</div>
					</SheetFooter>
				)}
			</SheetContent>
		</Sheet>
	);
}
