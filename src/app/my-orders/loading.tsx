import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function Loading() {
	return (
		<div className="container mx-auto py-8 px-2 max-w-7xl">
			<Skeleton className="h-8 w-40 mb-6" />
			<div className="space-y-4">
				{Array.from({ length: 3 }).map((_, i) => (
					<Card key={i}>
						<CardContent className="py-6 space-y-3">
							<div className="flex items-center justify-between">
								<Skeleton className="h-5 w-32" />
								<Skeleton className="h-4 w-28" />
							</div>
							<Skeleton className="h-4 w-28" />
							<div className="divide-y">
								{Array.from({ length: 2 }).map((_, j) => (
									<div key={j} className="flex items-center gap-3 py-3">
										<Skeleton className="w-12 h-12 rounded" />
										<div className="flex-1 min-w-0">
											<Skeleton className="h-4 w-40" />
											<Skeleton className="h-3 w-20 mt-1" />
										</div>
									</div>
								))}
							</div>
							<Skeleton className="h-4 w-24" />
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
