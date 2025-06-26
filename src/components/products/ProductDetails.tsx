"use client";

import React from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import SquareMagnifier from "./SquareMagnifier";
import { IProduct } from "@/types/product";

const mockReviews = [
	{ user: "Alice", rating: 5, review: "Excellent product! Highly recommend." },
	{ user: "Bob", rating: 4, review: "Works well, but packaging could be better." },
	{ user: "Charlie", rating: 3, review: "Average, does the job." },
];

export default function ProductDetailsClient({ product }: { product: IProduct }) {
	// =============== state for quantity ================
	const [quantity, setQuantity] = React.useState(1);
	// =============== average rating ================
	const avgRating = mockReviews.length
		? mockReviews.reduce((a, b) => a + b.rating, 0) / mockReviews.length
		: 0;

	return (
		<div className="container mx-auto py-8 px-2 max-w-5xl">
			<div className="flex flex-col md:flex-row gap-8">
				{/* =============== product image gallery =============== */}
				<div className="w-full md:w-1/2 flex flex-col gap-4">
					<Card className="p-4 flex items-center justify-center min-h-[320px] min-w-[320px] max-w-full relative">
						<div className="w-[320px] h-[320px] relative">
							<SquareMagnifier src={product.gallery[0]} alt={product.title} />
						</div>
					</Card>
					{/* =============== gallery thumbnails (if multiple) =============== */}
					{product.gallery.length > 1 && (
						<div className="flex gap-2 mt-2">
							{product.gallery.map((img: string, idx: number) => (
								<div
									key={img}
									className="w-16 h-16 border rounded overflow-hidden cursor-pointer"
								>
									<Image
										src={img}
										alt={product.title + " " + idx}
										width={64}
										height={64}
										style={{ objectFit: "contain" }}
									/>
								</div>
							))}
						</div>
					)}
				</div>
				{/* =============== product info =============== */}
				<div className="flex-1 flex flex-col gap-4">
					<h1 className="text-2xl font-bold mb-1">{product.title}</h1>
					<div className="flex items-center gap-2">
						{product.discountRate && (
							<span className="bg-orange-400 text-white text-xs font-bold px-2 py-1 rounded">
								{product.discountRate}% Off
							</span>
						)}
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
					<div className="flex items-center gap-2">
						{/* =============== rating stars =============== */}
						{[1, 2, 3, 4, 5].map((i) => (
							<Star
								key={i}
								className={
									i <= Math.round(avgRating)
										? "text-yellow-400 fill-yellow-300"
										: "text-gray-300"
								}
								size={20}
							/>
						))}
						<span className="text-sm text-gray-500">
							({mockReviews.length} reviews)
						</span>
					</div>
					<div className="text-gray-700 mb-2">{product.highlights}</div>
					<div className="flex flex-wrap gap-4 text-sm text-gray-600">
						<span>
							Brand: <b>{product.brand.name}</b>
						</span>
						<span>
							Category: <b>{product.category.name}</b>
						</span>
						<span>
							SKU: <b>{product.sku}</b>
						</span>
						<span>
							Stock: <b>{product.stock > 0 ? product.stock : "Out of stock"}</b>
						</span>
						<span>
							Warranty: <b>{product.warranty}</b>
						</span>
					</div>
					<div className="flex items-center gap-2 mt-4">
						{/* =============== quantity selector =============== */}
						<Button
							variant="outline"
							size="icon"
							onClick={() => setQuantity((q) => Math.max(1, q - 1))}
							disabled={quantity <= 1}
						>
							-
						</Button>
						<span className="px-4 text-lg font-semibold">{quantity}</span>
						<Button
							variant="outline"
							size="icon"
							onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
							disabled={quantity >= product.stock}
						>
							+
						</Button>
						<Button className="ml-4" disabled={product.stock === 0}>
							Add To Cart
						</Button>
					</div>
					<div className="mt-4">
						<h2 className="font-semibold mb-1">Description</h2>
						<p className="text-gray-700 text-sm">{product.description}</p>
					</div>
				</div>
			</div>
			{/* =============== reviews section =============== */}
			<div className="mt-10">
				<h2 className="text-xl font-bold mb-4">Customer Reviews</h2>
				<div className="flex flex-col gap-4">
					{mockReviews.length === 0 && (
						<div className="text-gray-500">No reviews yet.</div>
					)}
					{mockReviews.map((r, idx) => (
						<div key={idx} className="border rounded-lg p-4 bg-white shadow-sm">
							<div className="flex items-center gap-2 mb-1">
								{[1, 2, 3, 4, 5].map((i) => (
									<Star
										key={i}
										className={
											i <= r.rating
												? "text-yellow-400 fill-yellow-300"
												: "text-gray-300"
										}
										size={16}
									/>
								))}
								<span className="font-semibold text-gray-700 ml-2">{r.user}</span>
							</div>
							<div className="text-gray-700 text-sm">{r.review}</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
