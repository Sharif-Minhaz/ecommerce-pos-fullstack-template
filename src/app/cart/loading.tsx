import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function Loading() {
	return (
		<div className="container mx-auto py-8 px-2 max-w-7xl">
			<div className="flex flex-col lg:flex-row gap-8">
				<div className="flex-1">
					<Skeleton className="h-6 w-24 mb-4" />
					<div className="flex flex-col gap-6">
						{Array.from({ length: 3 }).map((_, i) => (
							<Card key={i} className="flex flex-col md:flex-row items-center gap-4 p-4">
								<Skeleton className="w-24 h-24 rounded" />
								<div className="flex-1 w-full">
									<Skeleton className="h-4 w-3/4 mb-2" />
									<Skeleton className="h-3 w-40" />
								</div>
								<div className="flex items-center gap-2">
									<Skeleton className="h-10 w-14" />
									<Skeleton className="h-10 w-10 rounded" />
								</div>
								<div className="min-w-[100px]">
									<Skeleton className="h-4 w-24 mb-1" />
									<Skeleton className="h-3 w-20" />
								</div>
							</Card>
						))}
					</div>
				</div>
				<div className="w-full lg:w-[350px] flex-shrink-0">
					<Card className="p-6 sticky top-6">
						<Skeleton className="h-6 w-32 mb-4" />
						<Skeleton className="h-4 w-24 mb-4" />
						<div className="flex items-center gap-2 mb-4">
							<Skeleton className="h-10 w-full" />
							<Skeleton className="h-10 w-24" />
						</div>
						<div className="flex flex-col gap-2 mb-4">
							<div className="flex justify-between">
								<Skeleton className="h-4 w-40" />
								<Skeleton className="h-4 w-20" />
							</div>
							<div className="flex justify-between">
								<Skeleton className="h-4 w-40" />
								<Skeleton className="h-4 w-16" />
							</div>
						</div>
						<div className="flex justify-between mb-4">
							<Skeleton className="h-6 w-20" />
							<Skeleton className="h-6 w-24" />
						</div>
						<Skeleton className="h-10 w-full" />
					</Card>
				</div>
			</div>
		</div>
	);
}
