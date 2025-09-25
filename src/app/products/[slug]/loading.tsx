import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
	return (
		<div className="container mx-auto px-4 py-8">
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				<div>
					<Skeleton className="h-80 w-full mb-4" />
					<div className="grid grid-cols-4 gap-2">
						{Array.from({ length: 4 }).map((_, i) => (
							<Skeleton key={i} className="h-20 w-full" />
						))}
					</div>
				</div>
				<div className="space-y-4">
					<Skeleton className="h-8 w-3/4" />
					<Skeleton className="h-6 w-1/3" />
					<Skeleton className="h-20 w-full" />
					<div className="flex gap-2">
						<Skeleton className="h-10 w-40" />
						<Skeleton className="h-10 w-24" />
					</div>
				</div>
			</div>
		</div>
	);
}
