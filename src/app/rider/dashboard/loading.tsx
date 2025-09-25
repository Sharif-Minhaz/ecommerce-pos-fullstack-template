import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
	return (
		<div className="container mx-auto px-4 py-8">
			<Skeleton className="h-8 w-48 mb-6" />
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				{Array.from({ length: 6 }).map((_, i) => (
					<div key={i} className="border rounded-md p-4 space-y-2">
						<Skeleton className="h-4 w-32" />
						<Skeleton className="h-8 w-24" />
					</div>
				))}
			</div>
		</div>
	);
}
