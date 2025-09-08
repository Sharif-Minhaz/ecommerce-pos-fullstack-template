import React from "react";
import ProductDetails from "@/components/products/ProductDetails";
import { getPublicProductBySlug } from "@/app/actions/product";

export default async function ProductDetailsPage({ params }: { params: { slug: string } }) {
	const res = await getPublicProductBySlug(params.slug);
	if (!res.success || !res.product) {
		return <div className="container mx-auto py-10">Product not found.</div>;
	}
	return <ProductDetails product={res.product as unknown as never} />;
}
