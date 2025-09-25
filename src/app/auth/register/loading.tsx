import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
	return (
		<div className="min-h-screen flex items-center justify-center px-4">
			<div className="w-full max-w-md border rounded-md p-6 space-y-4">
				<Skeleton className="h-8 w-40 mx-auto" />
				{Array.from({ length: 5 }).map((_, i) => (
					<div key={i} className="space-y-2">
						<Skeleton className="h-4 w-24" />
						<Skeleton className="h-10 w-full" />
					</div>
				))}
				<Skeleton className="h-10 w-full" />
			</div>
		</div>
	);
}
