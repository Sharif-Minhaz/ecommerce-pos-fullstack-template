import React from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Product from "../products/Product";
import { getFeaturedProducts } from "@/app/actions/product";
import { IProduct } from "@/types/product";

export default async function TopProducts() {
	const { products } = await getFeaturedProducts();

	return (
		<section className="bg-blue-50 rounded-xl container mx-auto pb-4 mt-8">
			<h2 className="text-xl dark:text-black font-semibold pt-6 p-4 mb-2 flex items-center gap-2 justify-between">
				Trending products{" "}
				<Link href="/products">
					<Button variant="default" size="sm" className="text-white">
						View All <ArrowRight className="w-4 h-4" />
					</Button>
				</Link>
			</h2>
			<div className="relative">
				<Carousel className="w-full">
					<CarouselContent className="px-4">
						{products.map((product: IProduct) => (
							<CarouselItem key={product.id} className="basis-1/6">
								<Product product={product} />
							</CarouselItem>
						))}
					</CarouselContent>
					<CarouselPrevious className="-left-6" />
					<CarouselNext className="-right-6" />
				</Carousel>
			</div>
		</section>
	);
}
