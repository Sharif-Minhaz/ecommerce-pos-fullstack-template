import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
	return (
		<div className="container mx-auto px-4 py-8">
			<div className="flex items-center justify-between mb-6">
				<div>
					<div className="flex items-center gap-2">
						<Skeleton className="h-8 w-8 rounded" />
						<Skeleton className="h-8 w-56" />
					</div>
					<Skeleton className="h-4 w-80 mt-2" />
				</div>
				<Skeleton className="h-10 w-32" />
			</div>
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
				{Array.from({ length: 4 }).map((_, i) => (
					<div key={i} className="border rounded-md p-4">
						<Skeleton className="h-10 w-24 mb-2" />
						<Skeleton className="h-3 w-20" />
					</div>
				))}
			</div>
			<div className="flex flex-col md:flex-row gap-4 mb-6">
				<div className="flex-1">
					<div className="relative">
						<Skeleton className="h-10 w-full" />
					</div>
				</div>
				<Skeleton className="h-10 w-40" />
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{Array.from({ length: 6 }).map((_, i) => (
					<div key={i} className="border rounded-md p-4 space-y-2">
						<Skeleton className="h-5 w-40" />
						<Skeleton className="h-4 w-56" />
						<div className="flex items-center gap-2">
							<Skeleton className="h-8 w-24" />
							<Skeleton className="h-8 w-24" />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
