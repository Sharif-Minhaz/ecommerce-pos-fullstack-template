"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Store, MapPin, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface ShopCardProps {
	shop: {
		_id: string;
		name: string;
		email: string;
		phoneNumber: string;
		is_ban: boolean;
		userType: "user" | "vendor" | "admin";
		shopName?: string;
		shopDescription?: string;
		shopImages?: string[];
		registrationNumber?: string;
		image?: string;
		createdAt: Date;
		updatedAt: Date;
		wishlist: unknown[];
	};
}

export default function ShopCard({ shop }: ShopCardProps) {
	return (
		<Card className="h-full flex flex-col">
			<CardContent className="flex flex-col items-center px-6">
				{/* =============== shop image =============== */}
				<div className="w-full h-[200px] relative mb-4 rounded-sm overflow-hidden bg-gray-100 flex items-center justify-center">
					{shop.shopImages && shop.shopImages.length > 0 ? (
						<Image
							src={shop.shopImages[0]}
							alt={shop.shopName || shop.name || "Shop"}
							fill
							sizes="100px"
							style={{ objectFit: "cover" }}
						/>
					) : (
						<Store className="w-[100px] h-[100px] text-gray-400" />
					)}
				</div>

				{/* =============== shop name =============== */}
				<h3 className="text-lg font-bold text-center mb-2 line-clamp-2">
					{shop.shopName || shop.name || "Unnamed Shop"}
				</h3>

				{/* =============== shop description =============== */}
				<p className="text-sm text-muted-foreground text-center line-clamp-3 mb-4">
					{shop.shopDescription || "No description available"}
				</p>

				{/* =============== shop rating =============== */}
				<div className="flex items-center gap-1 mb-4">
					<Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
					<span className="text-sm font-medium">4.5</span>
					<span className="text-sm text-muted-foreground">(120 reviews)</span>
				</div>

				{/* =============== shop location =============== */}
				<div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
					<MapPin className="w-4 h-4" />
					<span>Dhaka, Bangladesh</span>
				</div>
			</CardContent>

			<CardFooter className="mt-auto p-6 pt-0">
				<Link
					href={shop.registrationNumber ? `/shops/${shop.registrationNumber}` : `/shops/${shop._id}`}
					className="w-full"
				>
					<Button className="w-full" variant="default">
						View Shop
					</Button>
				</Link>
			</CardFooter>
		</Card>
	);
}
