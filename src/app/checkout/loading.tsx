import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function Loading() {
	return (
		<div className="container mx-auto py-8 px-2 max-w-7xl">
			<div className="flex flex-col lg:flex-row gap-8">
				<div className="flex-1">
					<Card>
						<CardContent className="py-8 px-4 sm:px-8 space-y-6">
							<div className="flex items-center gap-4">
								<Skeleton className="h-8 w-8 rounded-full" />
								<Skeleton className="h-5 w-40" />
								<Skeleton className="h-2 w-8" />
								<Skeleton className="h-8 w-8 rounded-full" />
								<Skeleton className="h-5 w-28" />
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{Array.from({ length: 8 }).map((_, i) => (
									<div key={i} className="space-y-2">
										<Skeleton className="h-4 w-24" />
										<Skeleton className="h-10 w-full" />
									</div>
								))}
							</div>
							<Skeleton className="h-12 w-full" />
						</CardContent>
					</Card>
				</div>
				<div className="w-full lg:w-[370px] flex-shrink-0">
					<Card className="sticky top-6">
						<CardContent className="py-8 px-4 sm:px-8 space-y-4">
							<Skeleton className="h-6 w-40" />
							<div className="space-y-2">
								<div className="flex justify-between">
									<Skeleton className="h-4 w-36" />
									<Skeleton className="h-4 w-16" />
								</div>
								<div className="flex justify-between">
									<Skeleton className="h-4 w-36" />
									<Skeleton className="h-4 w-16" />
								</div>
								<div className="flex justify-between">
									<Skeleton className="h-4 w-24" />
									<Skeleton className="h-4 w-10" />
								</div>
							</div>
							<div className="flex justify-between">
								<Skeleton className="h-7 w-16" />
								<Skeleton className="h-7 w-24" />
							</div>
							<div className="divide-y">
								{Array.from({ length: 3 }).map((_, i) => (
									<div key={i} className="flex items-center gap-3 py-3">
										<Skeleton className="w-14 h-14 rounded" />
										<div className="flex-1 min-w-0">
											<Skeleton className="h-4 w-40" />
											<Skeleton className="h-3 w-24 mt-1" />
										</div>
										<Skeleton className="h-4 w-16" />
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
