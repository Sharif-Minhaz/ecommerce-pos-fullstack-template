import React from "react";
import ProductDetails from "@/components/products/ProductDetails";
import { IProduct } from "@/types/product";

async function getProduct() {
	const product: IProduct = {
		id: 12,
		title: "Fuji Adapter",
		titleBN: "ফুজি অ্যাডাপ্টার",
		gallery: [
			"/products/fuji-adapter.webp",
			"/products/moulinex-genuine-blender.webp",
			"/products/smartlock-wires.webp",
		],
		discountRate: 25,
		price: 800,
		salePrice: 600,
		highlights: "Universal adapter for various electronic devices",
		highlightsBN: "বিভিন্ন ইলেকট্রনিক ডিভাইসের জন্য সর্বজনীন অ্যাডাপ্টার",
		category: {
			_id: "1",
			name: "Electronics",
			nameBN: "ইলেকট্রনিক্স",
			slug: "electronics",
			isActive: true,
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		brand: {
			_id: "1",
			name: "Fuji",
			nameBN: "ফুজি",
			slug: "fuji",
			isActive: true,
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		vendor: {
			_id: "1",
			name: "John Doe",
			email: "john@techmart.com",
			phoneNumber: "+8801712345678",
			is_ban: false,
			userType: "vendor",
			shopName: "TechMart Electronics",
			shopDescription:
				"Your one-stop destination for all electronic gadgets and accessories.",
			shopImages: [
				"https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop&crop=center",
			],
			registrationNumber: "TECH001",
			image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
			createdAt: new Date(),
			updatedAt: new Date(),
			wishlist: [],
		} as unknown as IProduct["vendor"],
		unit: "pcs",
		stock: 30,
		sku: "FUJ-ADAPT-001",
		slug: "fuji-adapter",
		description: "Compatible with multiple devices and provides stable power supply.",
		descriptionBN:
			"একাধিক ডিভাইসের সাথে সামঞ্জস্যপূর্ণ এবং স্থিতিশীল বিদ্যুৎ সরবরাহ প্রদান করে।",
		specification: "Input: 100-240V, Output: 5V/2A, Universal Compatibility",
		specificationBN: "ইনপুট: ১০০-২৪০ ভোল্ট, আউটপুট: ৫ ভোল্ট/২ এম্পিয়ার, সর্বজনীন সামঞ্জস্যতা",
		isActive: true,
		isFeatured: true,
		warranty: "6 Months Warranty",
		warrantyBN: "৬ মাস ওয়ারেন্টি",
		tags: ["adapter", "electronics", "universal"],
		createdAt: new Date(),
		updatedAt: new Date(),
	} as IProduct;
	return product;
}

export default async function ProductDetailsPage() {
	const product = await getProduct();
	return <ProductDetails product={product} />;
}
