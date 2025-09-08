import React from "react";
import Product from "@/components/products/Product";
import { IProduct } from "@/types/product";
import { Store, MapPin, Star, Phone, Mail, Calendar } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getShopByRegistrationNumber } from "@/app/actions/shop";
import { getProductsByVendor } from "@/app/actions/product";

// =============== get shop by registration number ================
async function getShop(reg: string) {
	const result = await getShopByRegistrationNumber(reg);
	if (result.success && result.shop) {
		return result.shop;
	}
	return null;
}

// =============== get products by vendor ================
async function getShopProducts(vendorId: string): Promise<IProduct[]> {
	const result = await getProductsByVendor(vendorId);
	if (result.success && result.products) {
		return result.products as IProduct[];
	}
	return [];
}

export default async function ShopPageDetails({ params }: { params: { reg: string } }) {
	const { reg } = await params;
	const shop = await getShop(reg);

	if (!shop) {
		return (
			<div className="container mx-auto px-4 py-8 text-center">
				<h1 className="text-2xl font-bold mb-4">Shop Not Found</h1>
				<p className="text-muted-foreground mb-6">The shop you&apos;re looking for doesn&apos;t exist.</p>
				<Link href="/shops" className="text-primary hover:underline">
					Back to Shops
				</Link>
			</div>
		);
	}

	const products = await getShopProducts(shop._id?.toString() || "");

	return (
		<div className="min-h-screen">
			{/* =============== shop banner =============== */}
			<div className="relative h-64 md:h-80 overflow-hidden">
				{shop.shopImages && shop.shopImages.length > 0 ? (
					<Image
						src={shop.shopImages?.[0] || ""}
						alt={shop.shopName || "Shop Banner"}
						fill
						sizes="100vw"
						style={{ objectFit: "cover" }}
					/>
				) : (
					<div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
						<Store className="w-24 h-24 text-white" />
					</div>
				)}
				<div className="absolute inset-0 bg-black bg-opacity-40"></div>
				<div className="absolute bottom-0 left-0 right-0 p-6 text-white">
					<h1 className="text-3xl md:text-4xl font-bold mb-2">{shop.shopName}</h1>
					<p className="text-lg opacity-90">{shop.shopDescription}</p>
				</div>
			</div>

			<div className="container mx-auto px-4 py-8">
				{/* =============== shop information =============== */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
					<div className="lg:col-span-2">
						<div className="bg-white rounded-lg shadow-md p-6">
							<h2 className="text-2xl font-bold mb-4">About This Shop</h2>
							<p className="text-muted-foreground mb-6 leading-relaxed">{shop.shopDescription}</p>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="flex items-center gap-3">
									<Phone className="w-5 h-5 text-primary" />
									<span>{shop.phoneNumber || ""}</span>
								</div>
								<div className="flex items-center gap-3">
									<Mail className="w-5 h-5 text-primary" />
									<span>{shop.email || ""}</span>
								</div>
								<div className="flex items-center gap-3">
									<MapPin className="w-5 h-5 text-primary" />
									<span>Dhaka, Bangladesh</span>
								</div>
								<div className="flex items-center gap-3">
									<Calendar className="w-5 h-5 text-primary" />
									<span>Member since {new Date(shop?.createdAt)?.toLocaleDateString()}</span>
								</div>
							</div>
						</div>
					</div>

					<div className="lg:col-span-1">
						<div className="bg-white rounded-lg shadow-md p-6">
							<h3 className="text-xl font-bold mb-4">Shop Rating</h3>
							<div className="flex items-center gap-2 mb-2">
								<Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
								<span className="text-2xl font-bold">{shop?.rating}</span>
							</div>
							<p className="text-muted-foreground mb-4">Based on 120 reviews</p>

							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<span className="text-sm">{shop?.rating}★</span>
									<div className="flex-1 bg-gray-200 rounded-full h-2">
										<div className="bg-yellow-400 w-[70%] h-2 rounded-full"></div>
									</div>
									<span className="text-sm">70%</span>
								</div>
								<div className="flex items-center gap-2">
									<span className="text-sm">{shop?.rating}★</span>
									<div className="flex-1 bg-gray-200 rounded-full h-2">
										<div className="bg-yellow-400 w-[20%] h-2 rounded-full"></div>
									</div>
									<span className="text-sm">20%</span>
								</div>
								<div className="flex items-center gap-2">
									<span className="text-sm">{shop?.rating}★</span>
									<div className="flex-1 bg-gray-200 rounded-full h-2">
										<div className="bg-yellow-400 w-[7%] h-2 rounded-full"></div>
									</div>
									<span className="text-sm">7%</span>
								</div>
								<div className="flex items-center gap-2">
									<span className="text-sm">{shop?.rating}★</span>
									<div className="flex-1 bg-gray-200 rounded-full h-2">
										<div className="bg-yellow-400 w-[2%] h-2 rounded-full"></div>
									</div>
									<span className="text-sm">2%</span>
								</div>
								<div className="flex items-center gap-2">
									<span className="text-sm">{shop?.rating}★</span>
									<div className="flex-1 bg-gray-200 rounded-full h-2">
										<div className="bg-yellow-400 w-[1%] h-2 rounded-full"></div>
									</div>
									<span className="text-sm">1%</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* =============== shop products =============== */}
				<div>
					<h2 className="text-2xl font-bold mb-6">Products from {shop.shopName}</h2>
					{products && products.length > 0 ? (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
							{products.map((product) => (
								<Product key={product._id?.toString() || product.slug} product={product} />
							))}
						</div>
					) : (
						<div className="text-center py-12">
							<Store className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
							<h3 className="text-xl font-semibold mb-2">No Products Available</h3>
							<p className="text-muted-foreground">This shop hasn&apos;t added any products yet.</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
