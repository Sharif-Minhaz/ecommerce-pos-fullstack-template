import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
	return (
		<div className="container mx-auto px-4 py-8">
			<div className="flex items-center justify-between mb-6">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-9 w-28" />
			</div>
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
				{Array.from({ length: 8 }).map((_, i) => (
					<div key={i} className="border rounded-md p-3 space-y-3">
						<Skeleton className="h-32 w-full" />
						<Skeleton className="h-4 w-3/4" />
						<div className="flex items-center justify-between">
							<Skeleton className="h-8 w-20" />
							<Skeleton className="h-8 w-20" />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
