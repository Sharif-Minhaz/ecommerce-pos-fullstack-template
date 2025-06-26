import React from "react";
import ProductDetails from "@/components/products/ProductDetails";

async function getProduct(slug: string) {
	const product = {
		id: 12,
		title: "Fuji Adapter",
		titleBN: "ফুজি অ্যাডাপ্টার",
		gallery: ["/products/fuji-adapter.webp"],
		discountRate: 25,
		price: 800,
		salePrice: 600,
		highlights: "Universal adapter for various electronic devices",
		highlightsBN: "বিভিন্ন ইলেকট্রনিক ডিভাইসের জন্য সর্বজনীন অ্যাডাপ্টার",
		category: { name: "Electronics" },
		brand: { name: "Fuji" },
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
		createdAt: new Date(),
	};
	return product;
}

export default async function ProductDetailsPage({ params }: { params: { slug: string } }) {
	const product = await getProduct(params.slug);
	return <ProductDetails product={product} />;
}
