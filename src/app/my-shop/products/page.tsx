"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Plus, Edit3, Trash2, Eye, Package, TrendingUp, DollarSign, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getVendorProducts, deleteProduct, createProduct, updateProduct } from "@/app/actions/product";
import { IProduct } from "@/types/product";
import ProductForm from "@/components/products/ProductForm";
import FloatingActionButton from "@/components/shared/FloatingActionButton";

export default function VendorProductsPage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [products, setProducts] = useState<IProduct[]>([]);
	const [loading, setLoading] = useState(true);
	const [showForm, setShowForm] = useState(false);
	const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);
	const [deletingProduct, setDeletingProduct] = useState<string | null>(null);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [productIdPendingDelete, setProductIdPendingDelete] = useState<string | null>(null);

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

		fetchProducts();
	}, [status, session, router]);

	// =============== fetch vendor products ================
	const fetchProducts = async () => {
		try {
			setLoading(true);
			const result = await getVendorProducts();

			if (result.success && result.products) {
				setProducts(result.products);
			} else {
				toast.error(result.error || "Failed to fetch products");
			}
		} catch (error) {
			console.error(error);
			toast.error("An error occurred while fetching products");
		} finally {
			setLoading(false);
		}
	};

	// =============== handle create product ================
	const handleCreateProduct = async (formData: FormData) => {
		try {
			const result = await createProduct(formData);

			if (result.success) {
				fetchProducts(); // Refresh the list
			}
			return result;
		} catch (error) {
			console.error(error);
			return { success: false, error: "Failed to create product" };
		}
	};

	// =============== handle edit product ================
	const handleEditProduct = async (formData: FormData) => {
		try {
			if (!editingProduct?._id) {
				return { success: false, error: "Product not found" };
			}

			const result = await updateProduct(editingProduct!._id?.toString(), formData);
			if (result.success) {
				fetchProducts(); // Refresh the list
			}
			return result;
		} catch (error) {
			console.error(error);
			return { success: false, error: "Failed to update product" };
		}
	};

	// =============== handle delete product ================
	const handleDeleteProduct = async (productId: string) => {
		try {
			setDeletingProduct(productId);
			const result = await deleteProduct(productId);

			if (result.success) {
				toast.success("Product deleted successfully!");
				fetchProducts(); // Refresh the list
			} else {
				toast.error(result.error || "Failed to delete product");
			}
		} catch (error) {
			console.error(error);
			toast.error("An error occurred while deleting the product");
		} finally {
			setDeletingProduct(null);
			setProductIdPendingDelete(null);
			setDeleteDialogOpen(false);
		}
	};

	// =============== open edit form ================
	const openEditForm = (product: IProduct) => {
		setEditingProduct(product);
		setShowForm(true);
	};

	// =============== close form ================
	const closeForm = () => {
		setShowForm(false);
		setEditingProduct(null);
		fetchProducts(); // Refresh the list
	};

	// =============== calculate statistics ================
	const totalProducts = products.length;
	const activeProducts = products.filter((p) => p.isActive).length;
	const featuredProducts = products.filter((p) => p.isFeatured).length;
	const totalValue = products.reduce((sum, p) => sum + p.stock * p.price, 0);

	if (status === "loading" || loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	return (
		<>
			<div className="container mx-auto px-4 py-8 max-w-7xl">
				<div className="mb-8">
					<h1 className="text-3xl font-bold tracking-tight">My Products</h1>
					<p className="text-muted-foreground">Manage your product catalog</p>
				</div>

				{/* Statistics Cards */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
					<Card>
						<CardContent className="p-6">
							<div className="flex items-center space-x-2">
								<Package className="h-5 w-5 text-blue-600" />
								<div>
									<p className="text-sm font-medium text-muted-foreground">Total Products</p>
									<p className="text-2xl font-bold">{totalProducts}</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-6">
							<div className="flex items-center space-x-2">
								<Package className="h-5 w-5 text-green-600" />
								<div>
									<p className="text-sm font-medium text-muted-foreground">Active Products</p>
									<p className="text-2xl font-bold">{activeProducts}</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-6">
							<div className="flex items-center space-x-2">
								<TrendingUp className="h-5 w-5 text-orange-600" />
								<div>
									<p className="text-sm font-medium text-muted-foreground">Featured Products</p>
									<p className="text-2xl font-bold">{featuredProducts}</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-6">
							<div className="flex items-center space-x-2">
								<DollarSign className="h-5 w-5 text-purple-600" />
								<div>
									<p className="text-sm font-medium text-muted-foreground">Total Inventory Value</p>
									<p className="text-2xl font-bold">৳{totalValue.toLocaleString()}</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Action Bar */}
				<div className="flex justify-between items-center mb-6">
					<div>
						<h2 className="text-xl font-semibold">Product Catalog</h2>
						<p className="text-muted-foreground">Manage your product listings</p>
					</div>
					<Button onClick={() => setShowForm(true)}>
						<Plus className="h-4 w-4 mr-2" />
						Add New Product
					</Button>
				</div>

				{/* Product Form Modal */}
				{showForm && (
					<div className="fixed inset-0 backdrop-blur-sm bg-black/10 bg-opacity-50 flex items-center justify-center z-50 p-4">
						<div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
							<div className="p-6">
								<div className="flex justify-between items-center mb-6">
									<h2 className="text-2xl font-bold">
										{editingProduct ? "Edit Product" : "Create New Product"}
									</h2>
									<Button variant="outline" size="icon" onClick={closeForm}>
										<X className="h-4 w-4" />
									</Button>
								</div>
								<ProductForm
									product={editingProduct || undefined}
									onSubmit={editingProduct ? handleEditProduct : handleCreateProduct}
									onCancel={closeForm}
								/>
							</div>
						</div>
					</div>
				)}

				{/* Products Grid */}
				{products.length === 0 ? (
					<Card>
						<CardContent className="p-12 text-center">
							<Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
							<h3 className="text-lg font-semibold mb-2">No products yet</h3>
							<p className="text-muted-foreground mb-4">
								Start building your product catalog by adding your first product.
							</p>
							<Button onClick={() => setShowForm(true)}>
								<Plus className="h-4 w-4 mr-2" />
								Add Your First Product
							</Button>
						</CardContent>
					</Card>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{products.map((product) => (
							<Card key={product._id?.toString() || ""} className="relative pt-0">
								{/* Status Badges */}
								<div className="absolute top-3 left-3 z-10 flex gap-2">
									{!product.isActive && (
										<span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
											Inactive
										</span>
									)}
									{product.isFeatured && (
										<span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded">
											Featured
										</span>
									)}
								</div>

								{/* Product Image */}
								<div className="relative h-48 bg-gray-100 rounded-t-lg overflow-hidden">
									{product.gallery && product.gallery.length > 0 ? (
										<Image
											src={product.gallery[0]}
											alt={product.title}
											fill
											className="object-cover"
										/>
									) : (
										<div className="flex items-center justify-center h-full">
											<Package className="h-12 w-12 text-gray-400" />
										</div>
									)}
								</div>

								<CardContent className="p-4">
									{/* Product Title */}
									<h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.title}</h3>

									{/* Product Details */}
									<div className="space-y-2 mb-4">
										<div className="flex justify-between text-sm">
											<span className="text-muted-foreground">Category:</span>
											<span>{product?.category?.name}</span>
										</div>
										<div className="flex justify-between text-sm">
											<span className="text-muted-foreground">Brand:</span>
											<span>{product?.brand?.name}</span>
										</div>
										<div className="flex justify-between text-sm">
											<span className="text-muted-foreground">SKU:</span>
											<span className="font-mono">{product.sku}</span>
										</div>
										<div className="flex justify-between text-sm">
											<span className="text-muted-foreground">Stock:</span>
											<span className={product.stock > 0 ? "text-green-600" : "text-red-600"}>
												{product.stock > 0 ? product.stock : "Out of Stock"}
											</span>
										</div>
									</div>

									{/* Pricing */}
									<div className="mb-4">
										<div className="flex items-center gap-2">
											<span className="text-lg font-bold text-primary">
												৳{product.salePrice?.toLocaleString() ?? product.price.toLocaleString()}
											</span>
											{product.salePrice && (
												<span className="text-muted-foreground text-sm line-through">
													৳{product.price.toLocaleString()}
												</span>
											)}
										</div>
										{product.discountRate && (
											<span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">
												{product.discountRate}% Off
											</span>
										)}
									</div>

									{/* Action Buttons */}
									<div className="flex gap-2">
										<Button
											variant="outline"
											size="sm"
											className="flex-1"
											onClick={() => openEditForm(product)}
										>
											<Edit3 className="h-4 w-4 mr-2" />
											Edit
										</Button>
										<Button variant="outline" size="sm" className="flex-1" asChild>
											<Link href={`/products/${product.slug}`}>
												<Eye className="h-4 w-4 mr-2" />
												View
											</Link>
										</Button>
										<Button
											variant="destructive"
											size="sm"
											onClick={() => {
												setProductIdPendingDelete(product._id?.toString() || "");
												setDeleteDialogOpen(true);
											}}
											disabled={deletingProduct === product._id}
										>
											{deletingProduct === product._id ? (
												<Loader2 className="h-4 w-4 animate-spin" />
											) : (
												<Trash2 className="h-4 w-4" />
											)}
										</Button>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</div>

			<FloatingActionButton />

			{/* =============== delete confirmation dialog ================ */}
			<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<AlertDialogContent className="top-[16%]">
					<AlertDialogHeader>
						<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete the product.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => {
								if (productIdPendingDelete) {
									handleDeleteProduct(productIdPendingDelete);
								}
							}}
						>
							Continue
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
