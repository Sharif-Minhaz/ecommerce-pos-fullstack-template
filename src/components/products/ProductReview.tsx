"use client";

import React, { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProductReviewProps {
	onSubmit?: (data: { rating: number; review: string }) => void;
	initialRating?: number;
	initialReview?: string;
	submitLabel?: string;
}

export default function ProductReview({
	onSubmit,
	initialRating = 0,
	initialReview = "",
	submitLabel,
}: ProductReviewProps) {
	const [rating, setRating] = useState(initialRating);
	const [hoverRating, setHoverRating] = useState(0);
	const [review, setReview] = useState(initialReview);

	useEffect(() => {
		setRating(initialRating || 0);
		setReview(initialReview || "");
	}, [initialRating, initialReview]);

	// =============== handle star click to set rating ================
	const handleStarClick = (starValue: number) => {
		setRating(starValue);
	};

	// =============== handle star hover for visual feedback ================
	const handleStarHover = (starValue: number) => {
		setHoverRating(starValue);
	};

	// =============== handle mouse leave to reset hover state ================
	const handleMouseLeave = () => {
		setHoverRating(0);
	};

	// =============== handle form submission ================
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (rating === 0) {
			alert("Please select a rating");
			return;
		}

		if (!review.trim()) {
			alert("Please write a review");
			return;
		}

		const reviewData = {
			rating,
			review: review.trim(),
		};

		onSubmit?.(reviewData);

		// =============== reset form after submission ================
		// leave state as-is; parent controls for edit vs create
	};

	return (
		<Card className="w-full max-w-md">
			<CardHeader>
				<CardTitle className="text-lg font-semibold">Write a Review</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					{/* =============== star rating section ================ */}
					<div className="space-y-2">
						<Label htmlFor="rating" className="text-sm font-medium">
							Rating *
						</Label>
						<div className="flex items-center gap-1" onMouseLeave={handleMouseLeave}>
							{[1, 2, 3, 4, 5].map((star) => (
								<button
									key={star}
									type="button"
									onClick={() => handleStarClick(star)}
									onMouseEnter={() => handleStarHover(star)}
									className="transition-colors duration-200 hover:scale-110"
								>
									<Star
										className={`h-6 w-6 ${
											star <= (hoverRating || rating)
												? "fill-yellow-400 text-yellow-400"
												: "text-gray-300"
										}`}
									/>
								</button>
							))}
						</div>
						{rating > 0 && (
							<p className="text-sm text-gray-600">
								You rated this product {rating} star{rating > 1 ? "s" : ""}
							</p>
						)}
					</div>

					{/* =============== review text area ================ */}
					<div className="space-y-2">
						<Label htmlFor="review" className="text-sm font-medium">
							Review *
						</Label>
						<Textarea
							id="review"
							placeholder="Share your thoughts about this product..."
							value={review}
							onChange={(e) => setReview(e.target.value)}
							className="min-h-[100px] resize-none"
							required
						/>
					</div>

					{/* =============== submit button ================ */}
					<Button type="submit" className="w-full">
						{submitLabel ?? "Submit Review"}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
