"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import { createProduct } from "@/app/actions/product";
import ProductForm from "@/components/products/ProductForm";
import FloatingActionButton from "@/components/shared/FloatingActionButton";

export default function NewProductPage() {
	const { data: session, status } = useSession();
	const router = useRouter();

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
	}, [status, session, router]);

	// =============== handle product creation ================
	const handleCreateProduct = async (formData: FormData) => {
		try {
			const result = await createProduct(formData);

			if (result.success) {
				toast.success("Product created successfully!");
				router.push("/my-shop/products");
			} else {
				toast.error(result.error || "Failed to create product");
			}

			return result;
		} catch {
			const errorMessage = "An error occurred while creating the product";
			toast.error(errorMessage);
			return { success: false, error: errorMessage };
		}
	};

	// =============== handle cancel ================
	const handleCancel = () => {
		router.push("/my-shop/products");
	};

	if (status === "loading") {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin" />
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
						<h1 className="text-3xl font-bold tracking-tight">Create New Product</h1>
						<p className="text-muted-foreground">Add a new product to your catalog</p>
					</div>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Product Information</CardTitle>
					<CardDescription>Fill in the details below to create your new product.</CardDescription>
				</CardHeader>
				<CardContent>
					<ProductForm onSubmit={handleCreateProduct} onCancel={handleCancel} />
				</CardContent>
			</Card>

			{/* =============== floating action button for quick product creation =============== */}
			<FloatingActionButton />
		</div>
	);
}
