import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
	return (
		<div className="container mx-auto px-4 py-8 max-w-4xl">
			<div className="mb-8">
				<div className="flex items-center gap-4 mb-4">
					<Skeleton className="h-10 w-10 rounded" />
					<div>
						<Skeleton className="h-8 w-64" />
						<Skeleton className="h-4 w-80 mt-2" />
					</div>
				</div>
			</div>
			<div className="border rounded-md p-6 space-y-4">
				<Skeleton className="h-6 w-40" />
				<Skeleton className="h-4 w-80" />
				{Array.from({ length: 10 }).map((_, i) => (
					<div key={i} className="space-y-2">
						<Skeleton className="h-4 w-24" />
						<Skeleton className="h-10 w-full" />
					</div>
				))}
				<Skeleton className="h-10 w-40" />
			</div>
		</div>
	);
}
