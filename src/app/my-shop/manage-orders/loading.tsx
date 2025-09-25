import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
	return (
		<div className="container mx-auto py-8 px-2 max-w-7xl">
			<Skeleton className="h-8 w-48 mb-6" />
			<div className="space-y-2">
				{Array.from({ length: 4 }).map((_, i) => (
					<div key={i} className="border rounded-md p-4">
						<div className="flex items-center justify-between">
							<div>
								<Skeleton className="h-5 w-32 mb-1" />
								<Skeleton className="h-4 w-60" />
							</div>
							<Skeleton className="h-4 w-24" />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
