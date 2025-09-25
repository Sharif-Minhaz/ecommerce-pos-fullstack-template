import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCardSkeleton from "@/components/skeletons/ProductCardSkeleton";

export default function Loading() {
	return (
		<div className="flex flex-col md:flex-row gap-4 md:gap-6 p-2 md:p-4">
			{/* =============== sticky filters sidebar =============== */}
			<div className="w-full md:w-72 md:shrink-0 mb-4 md:mb-0">
				<div className="md:sticky md:top-20 space-y-4">
					{/* =============== search =============== */}
					<div className="space-y-2 p-3 border rounded-md bg-background">
						<Skeleton className="h-4 w-24" />
						<Skeleton className="h-9 w-full" />
					</div>

					{/* =============== in-stock toggle =============== */}
					<div className="flex items-center gap-2 p-3 border rounded-md bg-background">
						<Skeleton className="h-5 w-9 rounded-full" />
						<Skeleton className="h-4 w-24" />
					</div>

					{/* =============== price range =============== */}
					<div className="space-y-3 p-3 border rounded-md bg-background">
						<Skeleton className="h-4 w-24" />
						<Skeleton className="h-2 w-full rounded" />
						<div className="flex items-center justify-between">
							<Skeleton className="h-6 w-16" />
							<Skeleton className="h-6 w-16" />
						</div>
					</div>

					{/* =============== categories =============== */}
					<div className="space-y-3 p-3 border rounded-md bg-background">
						<Skeleton className="h-4 w-24" />
						<div className="space-y-2">
							{Array.from({ length: 6 }).map((_, i) => (
								<div key={i} className="flex items-center gap-2">
									<Skeleton className="h-4 w-4 rounded" />
									<Skeleton className="h-4 w-40" />
								</div>
							))}
						</div>
					</div>

					{/* =============== brands =============== */}
					<div className="space-y-3 p-3 border rounded-md bg-background">
						<Skeleton className="h-4 w-24" />
						<div className="space-y-2">
							{Array.from({ length: 6 }).map((_, i) => (
								<div key={i} className="flex items-center gap-2">
									<Skeleton className="h-4 w-4 rounded" />
									<Skeleton className="h-4 w-40" />
								</div>
							))}
						</div>
					</div>
				</div>
			</div>

			{/* =============== product grid =============== */}
			<div className="flex-1">
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
					{Array.from({ length: 12 }).map((_, i) => (
						<ProductCardSkeleton key={i} />
					))}
				</div>
			</div>
		</div>
	);
}
