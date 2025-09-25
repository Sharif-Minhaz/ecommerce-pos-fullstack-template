import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
	return (
		<div className="min-h-screen">
			<div className="relative h-64 md:h-80 overflow-hidden">
				<Skeleton className="h-full w-full" />
				<div className="absolute bottom-0 left-0 right-0 p-6">
					<Skeleton className="h-8 w-64" />
					<Skeleton className="h-4 w-80 mt-2" />
				</div>
			</div>
			<div className="container mx-auto px-4 py-8">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
					<div className="lg:col-span-2">
						<div className="rounded-lg border p-6 space-y-4">
							<Skeleton className="h-7 w-40" />
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-5/6" />
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{Array.from({ length: 4 }).map((_, i) => (
									<div key={i} className="flex items-center gap-3">
										<Skeleton className="w-5 h-5 rounded" />
										<Skeleton className="h-4 w-40" />
									</div>
								))}
							</div>
						</div>
					</div>
					<div className="lg:col-span-1">
						<div className="rounded-lg border p-6 space-y-4">
							<Skeleton className="h-6 w-32" />
							{Array.from({ length: 5 }).map((_, i) => (
								<div key={i} className="flex items-center gap-2">
									<Skeleton className="h-4 w-8" />
									<div className="flex-1 bg-muted h-2 rounded-full">
										<div className="h-2 bg-primary/50 w-1/2 rounded-full" />
									</div>
									<Skeleton className="h-4 w-10" />
								</div>
							))}
						</div>
					</div>
				</div>
				<div>
					<Skeleton className="h-7 w-72 mb-6" />
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{Array.from({ length: 8 }).map((_, i) => (
							<div key={i} className="border rounded-md p-3">
								<Skeleton className="h-40 w-full mb-2" />
								<Skeleton className="h-4 w-3/4 mb-1" />
								<Skeleton className="h-4 w-1/2" />
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
