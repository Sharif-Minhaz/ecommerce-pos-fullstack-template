import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
	return (
		<div className="container mx-auto py-6 px-2 max-w-6xl">
			<div className="mb-4">
				<div className="flex gap-2">
					<Skeleton className="h-9 w-24" />
					<Skeleton className="h-9 w-24" />
					<Skeleton className="h-9 w-24" />
					<Skeleton className="h-9 w-24" />
				</div>
			</div>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				{Array.from({ length: 6 }).map((_, i) => (
					<div key={i} className="border rounded-md p-4 space-y-2">
						<Skeleton className="h-4 w-40" />
						<Skeleton className="h-8 w-24" />
					</div>
				))}
			</div>
			<div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
				<div className="border rounded-md p-4 space-y-3">
					<Skeleton className="h-6 w-48" />
					<div className="grid grid-cols-12 gap-3">
						<Skeleton className="h-10 col-span-6" />
						<Skeleton className="h-10 col-span-2" />
						<Skeleton className="h-10 col-span-2" />
						<Skeleton className="h-10 col-span-2" />
					</div>
					<Skeleton className="h-10 w-full" />
				</div>
				<div className="border rounded-md p-4 space-y-3">
					<Skeleton className="h-6 w-48" />
					<div className="grid grid-cols-12 gap-3">
						<Skeleton className="h-10 col-span-4" />
						<Skeleton className="h-10 col-span-2" />
						<Skeleton className="h-10 col-span-2" />
						<Skeleton className="h-10 col-span-2" />
						<Skeleton className="h-10 col-span-2" />
					</div>
					<Skeleton className="h-10 w-full" />
				</div>
			</div>
		</div>
	);
}
