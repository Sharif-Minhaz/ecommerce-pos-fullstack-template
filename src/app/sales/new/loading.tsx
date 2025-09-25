import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
	return (
		<div className="container mx-auto py-8 px-2 max-w-7xl">
			<div className="space-y-6">
				<Skeleton className="h-8 w-48" />
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{Array.from({ length: 8 }).map((_, i) => (
						<div key={i} className="space-y-2">
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-10 w-full" />
						</div>
					))}
				</div>
				<div className="flex justify-end">
					<Skeleton className="h-10 w-48" />
				</div>
			</div>
		</div>
	);
}
