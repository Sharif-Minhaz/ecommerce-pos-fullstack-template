"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { IProduct } from "@/types/product";
import { ShoppingBag } from "lucide-react";
import Image from "next/image";
import React from "react";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";

export default function Product({ product }: { product: IProduct }) {
	const { addToCart } = useCart();

	return (
		<Link href={`/products/${product.slug}`}>
			<Card className="relative h-full flex flex-col justify-between py-3">
				{/* =============== discount badge =============== */}
				{product.discountRate && (
					<span className="absolute top-2 right-2 bg-orange-400 text-white text-xs font-bold px-2 py-1 rounded z-10">
						{product.discountRate}% Off
					</span>
				)}
				<CardContent className="flex flex-col items-center p-0">
					<div className="w-[170px] h-[170px] relative mb-2 rounded overflow-hidden bg-white flex items-center justify-center">
						<Image
							src={product.gallery[0]}
							alt={product.title}
							fill
							sizes="170px"
							style={{ objectFit: "contain" }}
						/>
					</div>
					<div className="text-sm font-semibold text-slate-500 text-center line-clamp-2 my-1 min-h-[40px] px-2">
						{product.title}
					</div>
					<div className="flex items-center justify-center gap-2">
						<span className="text-lg font-bold text-primary">
							৳{" "}
							{product.salePrice?.toLocaleString() ?? product.price.toLocaleString()}
						</span>
						{product.salePrice && (
							<span className="text-muted-foreground text-sm line-through">
								৳ {product.price.toLocaleString()}
							</span>
						)}
					</div>
				</CardContent>
				<CardFooter className="-mt-2 px-3 pb-0">
					<Button
						onClick={() => addToCart(product, 1)}
						className="w-full"
						variant="default"
						size="sm"
					>
						Add To Cart <ShoppingBag className="w-4 h-4" />
					</Button>
				</CardFooter>
			</Card>
		</Link>
	);
}
