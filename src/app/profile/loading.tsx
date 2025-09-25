import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Loading() {
	return (
		<div className="container mx-auto px-4 py-8 max-w-4xl">
			<div className="mb-8">
				<Skeleton className="h-8 w-32 mb-2" />
				<Skeleton className="h-4 w-64" />
			</div>

			<div className="grid gap-6">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between">
						<div className="flex items-center space-x-4">
							<Skeleton className="w-16 h-16 rounded-full" />
							<div>
								<Skeleton className="h-6 w-40 mb-2" />
								<div className="flex items-center space-x-2">
									<Skeleton className="h-4 w-4" />
									<Skeleton className="h-4 w-36" />
								</div>
							</div>
						</div>
						<Skeleton className="h-10 w-28" />
					</CardHeader>
				</Card>

				<Card>
					<CardContent className="space-y-4 py-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Skeleton className="h-4 w-24" />
								<Skeleton className="h-10 w-full" />
							</div>
							<div className="space-y-2">
								<Skeleton className="h-4 w-24" />
								<Skeleton className="h-10 w-full" />
							</div>
						</div>
						<div className="space-y-2">
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-10 w-full" />
						</div>
						<div className="space-y-2">
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-10 w-full" />
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
