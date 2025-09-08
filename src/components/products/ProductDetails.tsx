"use client";

import React from "react";
import { Heart, Star, Trash2, Loader2, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import SquareMagnifier from "./SquareMagnifier";
import { IProduct } from "@/types/product";
import ProductReview from "./ProductReview";
import { useCart } from "@/hooks/useCart";
import { listProductReviews, upsertReview, deleteOwnReview } from "@/app/actions/review";
import { useSession } from "next-auth/react";

// local view type for reviews
type ReviewView = { _id: string; user?: { _id?: string; name?: string }; rating: number; review: string };

function getCategoryNameSafe(product: IProduct): string {
	return (product.category as unknown as { name?: string })?.name ?? "";
}

function getBrandNameSafe(product: IProduct): string {
	return (product.brand as unknown as { name?: string })?.name ?? "";
}

export default function ProductDetails({ product }: { product: IProduct }) {
	const { addToCart } = useCart();
	const { data: session } = useSession();
	// =============== state for quantity ================
	const [quantity, setQuantity] = React.useState(1);
	// =============== state for selected main image ================
	const [selectedImage, setSelectedImage] = React.useState(product.gallery[0]);
	// =============== reviews state ================
	const [reviews, setReviews] = React.useState<ReviewView[]>([]);
	const [loadingReviews, setLoadingReviews] = React.useState(true);
	const [, setSubmitting] = React.useState(false);
	const [isEditing, setIsEditing] = React.useState(false);
	const [ownReview, setOwnReview] = React.useState<{ rating: number; review: string } | null>(null);

	const avgRating = reviews.length ? reviews.reduce((a, b) => a + b.rating, 0) / reviews.length : 0;

	// =============== handle gallery image click ================
	const handleImageClick = (imageUrl: string) => {
		setSelectedImage(imageUrl);
	};

	// =============== load reviews ================
	React.useEffect(() => {
		let mounted = true;
		(async () => {
			try {
				setLoadingReviews(true);
				const res = await listProductReviews(
					product._id?.toString?.() || (product as unknown as { id: string }).id
				);
				if (mounted && res.success) {
					const list = (res.reviews || []) as ReviewView[];
					setReviews(list);
					const me = session?.user?.id;
					if (me) {
						const mine = list.find((r) => r?.user?._id === me);
						setOwnReview(mine ? { rating: mine.rating, review: mine.review } : null);
					} else {
						setOwnReview(null);
					}
				}
			} finally {
				if (mounted) setLoadingReviews(false);
			}
		})();
		return () => {
			mounted = false;
		};
	}, [product, session?.user?.id]);

	// =============== submit review ================
	const handleSubmitReview = async (data: { rating: number; review: string }) => {
		try {
			setSubmitting(true);
			const fd = new FormData();
			fd.set("rating", String(data.rating));
			fd.set("review", data.review);
			const res = await upsertReview(product._id?.toString?.() || (product as unknown as { id: string }).id, fd);
			if (res.success) {
				const list = await listProductReviews(
					product._id?.toString?.() || (product as unknown as { id: string }).id
				);
				if (list.success) {
					const newList = (list.reviews || []) as ReviewView[];
					setReviews(newList);
					const me = session?.user?.id;
					if (me) {
						const mine = newList.find((r) => r?.user?._id === me);
						setOwnReview(mine ? { rating: mine.rating, review: mine.review } : null);
					}
					setIsEditing(false);
				}
			}
		} finally {
			setSubmitting(false);
		}
	};

	// =============== delete own review ================
	const handleDeleteOwnReview = async () => {
		const res = await deleteOwnReview(product._id?.toString?.() || (product as unknown as { id: string }).id);
		if (res.success) {
			const list = await listProductReviews(
				product._id?.toString?.() || (product as unknown as { id: string }).id
			);
			if (list.success) {
				setReviews((list.reviews || []) as ReviewView[]);
				setOwnReview(null);
				setIsEditing(false);
			}
		}
	};

	return (
		<div className="container mx-auto py-8 px-2 max-w-5xl">
			<div className="flex flex-col md:flex-row gap-8">
				{/* =============== product image gallery =============== */}
				<div className="w-full md:w-1/2 flex flex-col gap-4">
					<Card className="p-4 flex items-center justify-center min-h-[320px] min-w-[320px] max-w-full relative">
						<div className="w-[320px] h-[320px] relative">
							<SquareMagnifier src={selectedImage} alt={product.title} />
						</div>
					</Card>
					{/* =============== gallery thumbnails (if multiple) =============== */}
					{product.gallery.length > 1 && (
						<div className="flex gap-2">
							{product.gallery.map((img: string, idx: number) => (
								<div
									key={img}
									className={`w-16 h-16 border-2 rounded overflow-hidden cursor-pointer transition-all duration-200 ${
										selectedImage === img
											? "border-primary shadow-md"
											: "border-gray-200 hover:border-gray-300"
									}`}
									onClick={() => handleImageClick(img)}
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
							৳ {product.salePrice?.toLocaleString() ?? product.price.toLocaleString()}
						</span>
						{product.salePrice && (
							<span className="text-muted-foreground text-sm line-through">
								৳ {product.price.toLocaleString()}
							</span>
						)}
					</div>
					<div className="flex items-center gap-1 cursor-pointer">
						<Heart size={18} />
						<span className="text-sm text-gray-500">Add to Wishlist</span>
					</div>
					<div className="flex items-center gap-2">
						{/* =============== rating stars =============== */}
						{[1, 2, 3, 4, 5].map((i) => (
							<Star
								key={i}
								className={
									i <= Math.round(avgRating) ? "text-yellow-400 fill-yellow-300" : "text-gray-300"
								}
								size={20}
							/>
						))}
						<span className="text-sm text-gray-500">({reviews.length} reviews)</span>
					</div>
					<div className="text-gray-700 mb-2">{product.highlights}</div>
					<div className="flex flex-wrap gap-4 text-sm text-gray-600">
						<span>
							Brand: <b>{getBrandNameSafe(product)}</b>
						</span>
						<span>
							Category: <b>{getCategoryNameSafe(product)}</b>
						</span>
						<span>
							SKU: <b>{product.sku}</b>
						</span>
						<span>
							Stock: <b>{product.stock > 0 ? product.stock : "Out of stock"}</b>
						</span>
						<span>
							Warranty: <b>{product.warranty ?? "N/A"}</b>
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
						<Button
							onClick={() => addToCart(product, quantity)}
							className="ml-4"
							disabled={product.stock === 0}
						>
							Add To Cart
						</Button>
					</div>
				</div>
			</div>
			<div className="mt-4">
				<h2 className="font-semibold mb-1">Description</h2>
				<p className="text-gray-700 text-sm">{product.description}</p>
			</div>
			{/* =============== reviews section =============== */}
			<div className="mt-10">
				<h2 className="text-xl font-bold mb-4">Customer Reviews</h2>
				{/* =============== customer review form / summary =============== */}
				{ownReview && !isEditing ? (
					<div className="w-full max-w-md">
						<div className="flex items-center justify-between mb-2">
							<h3 className="text-lg font-semibold">Your Review</h3>
							<Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
								<Edit3 className="w-4 h-4 mr-1" /> Edit
							</Button>
						</div>
						<div className="border rounded-lg p-4 bg-white shadow-sm">
							<div className="flex items-center gap-2 mb-1">
								{[1, 2, 3, 4, 5].map((i) => (
									<Star
										key={i}
										className={
											i <= ownReview.rating ? "text-yellow-400 fill-yellow-300" : "text-gray-300"
										}
										size={16}
									/>
								))}
							</div>
							<div className="text-gray-700 text-sm whitespace-pre-wrap">{ownReview.review}</div>
							<div className="flex gap-2 mt-2">
								<Button variant="destructive" size="sm" onClick={handleDeleteOwnReview}>
									<Trash2 className="w-4 h-4" /> Delete
								</Button>
							</div>
						</div>
					</div>
				) : (
					<ProductReview
						onSubmit={handleSubmitReview}
						initialRating={ownReview?.rating || 0}
						initialReview={ownReview?.review || ""}
						submitLabel={ownReview ? "Update Review" : "Submit Review"}
					/>
				)}
				{/* =============== customer reviews =============== */}
				<div className="flex flex-col gap-4 mt-4">
					{!loadingReviews && reviews.length === 0 && (
						<div className="text-gray-500">No reviews yet. Be the first to review this product.</div>
					)}
					{loadingReviews && (
						<div className="text-gray-500 flex items-center gap-2">
							<Loader2 className="w-4 h-4 animate-spin" /> Loading reviews...
						</div>
					)}
					{reviews.map((r) => (
						<div key={r._id} className="border rounded-lg p-4 bg-white shadow-sm">
							<div className="flex items-center gap-2 mb-1">
								{[1, 2, 3, 4, 5].map((i) => (
									<Star
										key={i}
										className={i <= r.rating ? "text-yellow-400 fill-yellow-300" : "text-gray-300"}
										size={16}
									/>
								))}
								<span className="font-semibold text-gray-700 ml-2">{r.user?.name ?? "Anonymous"}</span>
							</div>
							<div className="text-gray-700 text-sm">{r.review}</div>
							{session?.user?.id && r?.user?._id === session.user.id && (
								<div className="flex gap-2 mt-2">
									<Button variant="outline" size="sm" onClick={handleDeleteOwnReview}>
										<Trash2 className="w-4 h-4" />
										Delete my review
									</Button>
								</div>
							)}
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
