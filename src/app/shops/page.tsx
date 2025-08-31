"use client";

import React, { useEffect, useState } from "react";
import ShopCard from "@/components/shops/ShopCard";
import { getAllVendorShops } from "@/app/actions/shop";
import { Loader2 } from "lucide-react";

// =============== interface for shop data ================
interface Shop {
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
}

export default function ShopPage() {
	const [shops, setShops] = useState<Shop[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// =============== fetch shops on component mount ================
	useEffect(() => {
		fetchShops();
	}, []);

	const fetchShops = async () => {
		try {
			setLoading(true);
			setError(null);

			const result = await getAllVendorShops();

			if (result.success && result.shops) {
				setShops(result.shops);
			} else {
				setError(result.error || "Failed to fetch shops");
			}
		} catch {
			setError("An error occurred while fetching shops");
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="text-center">
					<Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
					<p className="text-muted-foreground">Loading shops...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="text-center">
					<p className="text-red-500 mb-4">{error}</p>
					<button
						onClick={fetchShops}
						className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
					>
						Try Again
					</button>
				</div>
			</div>
		);
	}

	if (shops.length === 0) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="text-center">
					<h1 className="text-3xl font-bold mb-2">Our Trusted Shops</h1>
					<p className="text-muted-foreground mb-4">Discover amazing products from our verified vendors</p>
					<p className="text-muted-foreground">No shops available at the moment. Check back later!</p>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8">
			{/* =============== page header =============== */}
			<div className="text-center mb-8">
				<h1 className="text-3xl font-bold mb-2">Our Trusted Shops</h1>
				<p className="text-muted-foreground">Discover amazing products from our verified vendors</p>
			</div>

			{/* =============== shops grid =============== */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{shops.map((shop) => (
					<ShopCard key={shop._id} shop={shop} />
				))}
			</div>
		</div>
	);
}
