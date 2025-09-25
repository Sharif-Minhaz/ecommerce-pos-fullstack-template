import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
	return (
		<div className="container mx-auto px-4 py-8">
			<div className="text-center mb-8">
				<Skeleton className="h-9 w-60 mx-auto mb-2" />
				<Skeleton className="h-4 w-80 mx-auto" />
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{Array.from({ length: 6 }).map((_, i) => (
					<div key={i} className="border rounded-md p-4 space-y-3">
						<Skeleton className="h-32 w-full rounded" />
						<Skeleton className="h-5 w-40" />
						<Skeleton className="h-4 w-56" />
						<div className="flex items-center gap-2">
							<Skeleton className="h-4 w-20" />
							<Skeleton className="h-4 w-10" />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
