"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { IProduct } from "@/types/product";
import { ShoppingBag, Store } from "lucide-react";
import Image from "next/image";
import React from "react";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";

// =============== type guard for vendor shop ================
function isVendorShop(vendor: unknown): vendor is { shopName: string; registrationNumber: string } {
	return (
		vendor !== null &&
		typeof vendor === "object" &&
		vendor !== undefined &&
		"shopName" in vendor &&
		"registrationNumber" in vendor &&
		typeof (vendor as Record<string, unknown>).shopName === "string" &&
		typeof (vendor as Record<string, unknown>).registrationNumber === "string"
	);
}

export default function Product({ product }: { product: IProduct }) {
	const { addToCart } = useCart();

	return (
		<Card className="relative h-full flex overflow-hidden flex-col justify-between pb-3 !pt-0">
			{/* =============== discount badge =============== */}
			{product.discountRate && (
				<span className="absolute top-2 right-2 bg-orange-400 text-white text-xs font-bold px-2 py-1 rounded z-10">
					{product.discountRate}% Off
				</span>
			)}

			<CardContent className="flex flex-col items-center p-0">
				<Link href={`/products/${product.slug}`} className="w-full">
					<div className="w-full h-[170px] mx-auto relative mb-2 rounded bg-white flex items-center justify-center">
						<Image
							src={product.gallery[0]}
							alt={product.title}
							fill
							sizes="170px"
							className="object-cover overflow-hidden"
						/>
					</div>
					<div className="text-sm font-semibold text-slate-500 text-center line-clamp-2 my-1 min-h-[40px] px-2">
						{product.title}
					</div>
					<div className="flex items-center justify-center gap-2">
						<span className="text-lg font-bold text-primary">
							৳ {product.salePrice?.toLocaleString() ?? product.price.toLocaleString()}
						</span>
						{product.salePrice && (
							<span className="text-muted-foreground text-sm line-through">
								৳ {product.price.toLocaleString()}
							</span>
						)}
					</div>
				</Link>

				{/* =============== vendor shop name =============== */}
				{isVendorShop(product.vendor) && (
					<Link
						href={`/shops/${product.vendor.registrationNumber}`}
						className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors mt-2 px-2"
					>
						<Store className="w-3 h-3" />
						<span className="line-clamp-1">{product.vendor.shopName}</span>
					</Link>
				)}
			</CardContent>

			<CardFooter className="-mt-2 px-3 pb-0">
				<Button onClick={() => addToCart(product, 1)} className="w-full" variant="default" size="sm">
					Add To Cart <ShoppingBag className="w-4 h-4" />
				</Button>
			</CardFooter>
		</Card>
	);
}
