import React from "react";
import Image from "next/image";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";

// Import hero images
import HeroImage1 from "@/assets/kitchen_items_Hero_Banner_ArbiArt_oard_en.webp";
import HeroImage2 from "@/assets/Room_Heaters_Hero_BannerArtboad_en.webp";
import HeroImage3 from "@/assets/Female_Personal_Care_Product_Hero_BannerArtboard_en.webp";
import RightSideImage from "@/assets/Hero_Right Side_Offer_Parsonal_Care.webp";

const heroItems = [
	{
		image: HeroImage1,
		title: "Kitchen Essentials",
		description: "Discover our premium kitchen collection",
	},
	{
		image: HeroImage2,
		title: "Room Heaters",
		description: "Stay warm this season",
	},
	{
		image: HeroImage3,
		title: "Personal Care",
		description: "Premium personal care products",
	},
];

export default function Hero() {
	return (
		<div className="container mx-auto py-6">
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{/* Left side carousel */}
				<div className="relative col-span-2">
					<Carousel className="w-ful">
						<CarouselContent>
							{heroItems.map((item, index) => (
								<CarouselItem key={index}>
									<div className="relative aspect-[16/9] rounded-lg overflow-hidden">
										<Image
											src={item.image}
											alt={item.title}
											fill
											className="object-cover"
											priority={index === 0}
										/>
										<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
										<div className="absolute bottom-0 left-0 p-6 text-white">
											<h2 className="text-2xl font-bold mb-2">
												{item.title}
											</h2>
											<p className="text-sm text-gray-200">
												{item.description}
											</p>
										</div>
									</div>
								</CarouselItem>
							))}
						</CarouselContent>
						<CarouselPrevious className="left-2" />
						<CarouselNext className="right-2" />
					</Carousel>
				</div>

				{/* Right side image */}
				<Image
					src={RightSideImage}
					alt="Special Offer"
					className="rounded-lg w-full h-full object-cover"
					priority
				/>
			</div>
		</div>
	);
}
