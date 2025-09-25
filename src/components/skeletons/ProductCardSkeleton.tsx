import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export default function ProductCardSkeleton() {
	return (
		<Card className="relative h-full flex overflow-hidden flex-col justify-between pb-3 !pt-0">
			{/* =============== discount badge =============== */}
			<span className="absolute top-2 right-2 z-10">
				<Skeleton className="h-5 w-14 rounded" />
			</span>

			<CardContent className="flex flex-col items-center p-0 w-full">
				{/* =============== image =============== */}
				<div className="w-full h-[170px] mx-auto relative mb-2 rounded bg-white flex items-center justify-center overflow-hidden">
					<Skeleton className="h-full w-full" />
				</div>

				{/* =============== title =============== */}
				<div className="w-full px-2 my-1 min-h-[40px] space-y-2">
					<Skeleton className="h-4 w-11/12" />
					<Skeleton className="h-4 w-8/12" />
				</div>

				{/* =============== price =============== */}
				<div className="flex items-center justify-center gap-2 w-full px-2">
					<Skeleton className="h-6 w-24" />
					<Skeleton className="h-4 w-16" />
				</div>

				{/* =============== vendor shop name =============== */}
				<div className="flex items-center gap-1 text-xs mt-2 px-2 w-full">
					<Skeleton className="h-3.5 w-3.5 rounded" />
					<Skeleton className="h-4 w-24" />
				</div>
			</CardContent>

			<CardFooter className="-mt-2 px-3 pb-0 w-full">
				{/* =============== add to cart button =============== */}
				<Skeleton className="h-9 w-full" />
			</CardFooter>
		</Card>
	);
}
