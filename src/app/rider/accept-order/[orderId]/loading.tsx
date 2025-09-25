import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
	return (
		<div className="container mx-auto px-4 py-8 max-w-3xl">
			<Skeleton className="h-8 w-64 mb-6" />
			<div className="space-y-3">
				{Array.from({ length: 5 }).map((_, i) => (
					<Skeleton key={i} className="h-10 w-full" />
				))}
			</div>
			<div className="flex justify-end mt-6">
				<Skeleton className="h-10 w-40" />
			</div>
		</div>
	);
}
