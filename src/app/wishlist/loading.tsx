import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCardSkeleton from "@/components/skeletons/ProductCardSkeleton";

export default function Loading() {
	return (
		<div className="container mx-auto px-4 py-8 max-w-5xl">
			<Skeleton className="h-8 w-40 mb-6" />
			<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
				{Array.from({ length: 8 }).map((_, i) => (
					<ProductCardSkeleton key={i} />
				))}
			</div>
		</div>
	);
}
