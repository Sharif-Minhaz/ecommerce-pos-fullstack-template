"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import { getProductById, updateProduct } from "@/app/actions/product";
import { IProduct } from "@/types/product";
import ProductForm from "@/components/products/ProductForm";
import FloatingActionButton from "@/components/shared/FloatingActionButton";

interface EditProductPageProps {
	params: {
		id: string;
	};
}

export default function EditProductPage({ params }: EditProductPageProps) {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [product, setProduct] = useState<IProduct | null>(null);
	const [loading, setLoading] = useState(true);

	// =============== check authentication and vendor status ================
	useEffect(() => {
		if (status === "loading") return;

		if (status === "unauthenticated") {
			router.push("/auth/login");
			return;
		}

		if (session?.user?.userType !== "vendor") {
			router.push("/profile");
			return;
		}

		fetchProduct();
	}, [status, session, router, params.id]);

	// =============== fetch product data ================
	const fetchProduct = async () => {
		try {
			setLoading(true);
			const result = await getProductById(params.id);

			if (result.success && result.product) {
				setProduct(result.product);
			} else {
				toast.error(result.error || "Failed to fetch product");
				router.push("/my-shop/products");
			}
		} catch {
			toast.error("An error occurred while fetching product");
			router.push("/my-shop/products");
		} finally {
			setLoading(false);
		}
	};

	// =============== handle product update ================
	const handleUpdateProduct = async (formData: FormData) => {
		try {
			const result = await updateProduct(params.id, formData);

			if (result.success) {
				toast.success("Product updated successfully!");
				router.push("/my-shop/products");
			} else {
				toast.error(result.error || "Failed to update product");
			}

			return result;
		} catch {
			const errorMessage = "An error occurred while updating the product";
			toast.error(errorMessage);
			return { success: false, error: errorMessage };
		}
	};

	// =============== handle cancel ================
	const handleCancel = () => {
		router.push("/my-shop/products");
	};

	if (status === "loading" || loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	if (!product) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<p className="text-muted-foreground">Product not found</p>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8 max-w-4xl">
			<div className="mb-8">
				<div className="flex items-center gap-4 mb-4">
					<Button variant="outline" size="icon" onClick={() => router.back()}>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<div>
						<h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
						<p className="text-muted-foreground">Update your product information</p>
					</div>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Product Details</CardTitle>
					<CardDescription>Make changes to your product. Click save when you&apos;re done.</CardDescription>
				</CardHeader>
				<CardContent>
					<ProductForm product={product} onSubmit={handleUpdateProduct} onCancel={handleCancel} />
				</CardContent>
			</Card>

			<FloatingActionButton />
		</div>
	);
}
