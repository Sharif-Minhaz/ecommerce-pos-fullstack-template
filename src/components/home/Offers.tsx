import { Package, Star, Box } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";

const offers = [
	{
		id: 1,
		title: "Special Offer",
		offer: "Up to 40% OFF",
		description: "Limited time deals on select items!",
		link: "/products",
		linkText: "Shop Now",
		icon: Package,
		color: "bg-gradient-to-br from-purple-600 to-purple-300 text-white",
		button: "bg-white text-purple-700 hover:bg-purple-100",
	},
	{
		id: 2,
		title: "Wholesale",
		offer: "Best Prices",
		description: "For Your Business Needs",
		link: "/products",
		linkText: "View Wholesale",
		icon: Box,
		color: "bg-gradient-to-br from-[#507687] to-[#507687] text-white",
		button: "bg-white text-blue-700 hover:bg-blue-100",
	},
	{
		id: 3,
		title: "Our Products",
		offer: "Top Rated",
		description: "Best-Priced Quality Products",
		link: "/products",
		linkText: "Explore Products",
		icon: Star,
		color: "bg-gradient-to-br from-[#96CEB4] to-[#38a773] text-white",
		button: "bg-white text-green-700 hover:bg-green-100",
	},
];

export default function Offers() {
	return (
		<section className="container mx-auto pb-4 mt-14">
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
				{offers.map((offer) => {
					const Icon = offer.icon;
					return (
						<div
							key={offer.id}
							className={`rounded-xl p-6 flex flex-col items-start justify-between min-h-[260px] shadow-sm ${offer.color}`}
						>
							<div>
								<div className="flex items-center gap-3 mb-2">
									<span className="text-lg font-semibold">{offer.title}</span>
								</div>
								<Icon className="w-16 h-16 my-4" />

								<div className="text-3xl font-bold mb-1">{offer.offer}</div>
								<div className="mb-4 opacity-90">{offer.description}</div>
							</div>
							<Button
								className={`font-semibold w-full mt-auto ${offer.button}`}
								variant="default"
								size="lg"
							>
								{offer.linkText}
							</Button>
						</div>
					);
				})}
			</div>
		</section>
	);
}
