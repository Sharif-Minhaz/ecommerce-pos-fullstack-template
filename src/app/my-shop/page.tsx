"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getVendorShop, updateVendorShop } from "@/app/actions/shop";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Store, Edit3, Save, X, Image as ImageIcon, Trash2, Package, Tag, FolderOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import FloatingActionButton from "@/components/shared/FloatingActionButton";

interface VendorShop {
	_id: string;
	shopName: string;
	shopDescription: string;
	shopImages: string[];
	registrationNumber: string;
	image?: string;
	updatedAt: string;
}

export default function MyShopPage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [shop, setShop] = useState<VendorShop | null>(null);
	const [loading, setLoading] = useState(true);
	const [updating, setUpdating] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [uploadingImage, setUploadingImage] = useState(false);
	const [formData, setFormData] = useState({
		shopName: "",
		shopDescription: "",
		registrationNumber: "",
	});

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

		fetchShop();
	}, [status, session, router]);

	const fetchShop = async () => {
		try {
			setLoading(true);
			const result = await getVendorShop();

			if (result.success && result.shop) {
				setShop(result.shop);
				setFormData({
					shopName: result.shop.shopName || "",
					shopDescription: result.shop.shopDescription || "",
					registrationNumber: result.shop.registrationNumber || "",
				});
			} else {
				toast.error(result.error || "Failed to fetch shop information");
			}
		} catch {
			toast.error("An error occurred while fetching shop information");
		} finally {
			setLoading(false);
		}
	};

	const handleInputChange = (field: string, value: string) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			setUpdating(true);
			const formDataObj = new FormData();

			Object.entries(formData).forEach(([key, value]) => {
				formDataObj.append(key, value);
			});

			const result = await updateVendorShop(formDataObj);

			if (result.success && result.shop) {
				setShop(result.shop);
				setIsEditing(false);
				toast.success("Shop information updated successfully!");
			} else {
				toast.error(result.error || "Failed to update shop information");
			}
		} catch {
			toast.error("An error occurred while updating shop information");
		} finally {
			setUpdating(false);
		}
	};

	const handleCancel = () => {
		if (shop) {
			setFormData({
				shopName: shop.shopName || "",
				shopDescription: shop.shopDescription || "",
				registrationNumber: shop.registrationNumber || "",
			});
		}
		setIsEditing(false);
	};

	const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		try {
			setUploadingImage(true);
			const formData = new FormData();
			formData.append("image", file);

			const result = await updateVendorShop(formData, true);

			if (result.success && result.shop) {
				setShop(result.shop);
				toast.success("Shop image uploaded successfully!");
			} else {
				console.error(result.error);
				toast.error(result.error || "Failed to upload image");
			}
		} catch (error) {
			console.error(error);
			toast.error("An error occurred while uploading image");
		} finally {
			setUploadingImage(false);
		}
	};

	const removeImage = async (imageUrl: string) => {
		try {
			const result = await updateVendorShop(new FormData(), false, imageUrl);

			if (result.success && result.shop) {
				setShop(result.shop);
				toast.success("Image removed successfully!");
			} else {
				toast.error(result.error || "Failed to remove image");
			}
		} catch {
			toast.error("An error occurred while removing image");
		}
	};

	if (status === "loading" || loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	if (!shop) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<p className="text-muted-foreground">Shop information not found</p>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8 max-w-6xl">
			<div className="mb-8">
				<div className="flex justify-between items-center">
					<div>
						<h1 className="text-3xl font-bold tracking-tight">My Shop</h1>
						<p className="text-muted-foreground">Manage your shop information and images</p>
					</div>
					<div className="flex gap-2">
						<Button asChild>
							<Link href="/my-shop/products">
								<Package className="h-4 w-4 mr-2" />
								Products
							</Link>
						</Button>
						<Button asChild variant="outline">
							<Link href="/my-shop/brands">
								<Tag className="h-4 w-4 mr-2" />
								Brands
							</Link>
						</Button>
						<Button asChild variant="outline">
							<Link href="/my-shop/categories">
								<FolderOpen className="h-4 w-4 mr-2" />
								Categories
							</Link>
						</Button>
					</div>
				</div>
			</div>

			{/* =============== quick navigation section ================ */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
				<Card className="p-6 text-center hover:shadow-md transition-shadow">
					<Package className="h-8 w-8 mx-auto mb-2 text-blue-600" />
					<h3 className="text-lg font-semibold mb-2">Products</h3>
					<p className="text-sm text-gray-600 mb-4">Manage your product inventory</p>
					<Link href="/my-shop/products">
						<Button size="sm" className="w-full">
							View Products
						</Button>
					</Link>
				</Card>

				<Card className="p-6 text-center hover:shadow-md transition-shadow">
					<Tag className="h-8 w-8 mx-auto mb-2 text-green-600" />
					<h3 className="text-lg font-semibold mb-2">Brands</h3>
					<p className="text-sm text-gray-600 mb-4">Manage your brand collection</p>
					<Link href="/my-shop/brands">
						<Button size="sm" variant="outline" className="w-full">
							View Brands
						</Button>
					</Link>
				</Card>

				<Card className="p-6 text-center hover:shadow-md transition-shadow">
					<FolderOpen className="h-8 w-8 mx-auto mb-2 text-purple-600" />
					<h3 className="text-lg font-semibold mb-2">Categories</h3>
					<p className="text-sm text-gray-600 mb-4">Organize product categories</p>
					<Link href="/my-shop/categories">
						<Button size="sm" variant="outline" className="w-full">
							View Categories
						</Button>
					</Link>
				</Card>
			</div>

			<div className="grid gap-6">
				{/* Shop Header */}
				<Card>
					<CardHeader className="flex flex-row items-center justify-between">
						<div className="flex items-center space-x-4">
							<div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
								{shop.image ? (
									<Image
										src={shop.image}
										alt={shop.shopName}
										width={64}
										height={64}
										className="rounded-full object-cover"
									/>
								) : (
									<Store className="h-8 w-8 text-primary" />
								)}
							</div>
							<div>
								<CardTitle className="text-2xl">{shop.shopName}</CardTitle>
								<CardDescription>Registration: {shop.registrationNumber}</CardDescription>
							</div>
						</div>
						<div className="flex items-center space-x-2">
							{!isEditing ? (
								<Button onClick={() => setIsEditing(true)} variant="outline">
									<Edit3 className="h-4 w-4 mr-2" />
									Edit Shop
								</Button>
							) : (
								<div className="flex space-x-2">
									<Button onClick={handleCancel} variant="outline">
										<X className="h-4 w-4 mr-2" />
										Cancel
									</Button>
									<Button onClick={handleSubmit} disabled={updating}>
										{updating ? (
											<Loader2 className="h-4 w-4 mr-2 animate-spin" />
										) : (
											<Save className="h-4 w-4 mr-2" />
										)}
										Save Changes
									</Button>
								</div>
							)}
						</div>
					</CardHeader>
				</Card>

				{/* Shop Form */}
				<form onSubmit={handleSubmit}>
					<div className="grid gap-6">
						{/* Shop Information */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center space-x-2">
									<Store className="h-5 w-5" />
									<span>Shop Information</span>
								</CardTitle>
								<CardDescription>Your business details and shop information</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="shopName">Shop Name</Label>
										<Input
											id="shopName"
											value={formData.shopName}
											onChange={(e) => handleInputChange("shopName", e.target.value)}
											disabled={!isEditing}
											required
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="registrationNumber">Registration Number</Label>
										<Input
											id="registrationNumber"
											value={formData.registrationNumber}
											onChange={(e) => handleInputChange("registrationNumber", e.target.value)}
											disabled={!isEditing}
											required
										/>
									</div>
								</div>

								<div className="space-y-2">
									<Label htmlFor="shopDescription">Shop Description</Label>
									<Textarea
										id="shopDescription"
										value={formData.shopDescription}
										onChange={(e) => handleInputChange("shopDescription", e.target.value)}
										disabled={!isEditing}
										placeholder="Describe your shop and what you offer..."
										rows={4}
										required
									/>
								</div>
							</CardContent>
						</Card>

						{/* Shop Images */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center space-x-2">
									<ImageIcon className="h-5 w-5" />
									<span>Shop Images</span>
								</CardTitle>
								<CardDescription>Upload and manage images for your shop</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								{/* Image Upload */}
								<div className="space-y-2">
									<Label htmlFor="imageUpload">Upload New Image</Label>
									<div className="flex items-center space-x-2">
										<Input
											id="imageUpload"
											type="file"
											accept="image/*"
											onChange={handleImageUpload}
											disabled={uploadingImage}
											className="flex-1"
										/>
										{uploadingImage && <Loader2 className="h-4 w-4 animate-spin" />}
									</div>
									<p className="text-sm text-muted-foreground">
										Upload high-quality images to showcase your shop
									</p>
								</div>

								{/* Current Images */}
								{shop.shopImages && shop.shopImages.length > 0 && (
									<div className="space-y-3">
										<Label>Current Images</Label>
										<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
											{shop.shopImages.map((imageUrl, index) => (
												<div key={index} className="relative group">
													<Image
														src={imageUrl}
														alt={`Shop image ${index + 1}`}
														width={200}
														height={200}
														className="w-full h-32 object-cover rounded-lg"
													/>
													<Button
														variant="destructive"
														size="sm"
														className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
														onClick={() => removeImage(imageUrl)}
													>
														<Trash2 className="h-4 w-4" />
													</Button>
												</div>
											))}
										</div>
									</div>
								)}
							</CardContent>
						</Card>

						{/* Last Updated */}
						<Card>
							<CardHeader>
								<CardTitle>Last Updated</CardTitle>
								<CardDescription>When your shop information was last modified</CardDescription>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-muted-foreground">
									{new Date(shop.updatedAt).toLocaleString()}
								</p>
							</CardContent>
						</Card>
					</div>
				</form>
			</div>

			{/* =============== floating action button for quick product creation =============== */}
			<FloatingActionButton />
		</div>
	);
}
