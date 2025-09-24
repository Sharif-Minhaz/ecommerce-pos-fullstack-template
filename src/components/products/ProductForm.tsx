"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, Plus, X, Image as ImageIcon, Trash2, Pencil } from "lucide-react";
import Image from "next/image";
import { IProduct, ProductUnit } from "@/types/product";
import { getCategories, createCategoryQuick } from "@/app/actions/category";
import { getBrands, createBrandQuick } from "@/app/actions/brand";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { UNITS } from "@/constant";

interface ProductFormProps {
	product?: IProduct;
	onSubmit: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
	onCancel: () => void;
}

interface Category {
	_id: string;
	name: string;
	nameBN: string;
	slug: string;
}

interface Brand {
	_id: string;
	name: string;
	nameBN: string;
	slug: string;
}

type CategoriesResult = { success: boolean; categories?: Category[] };
type BrandsResult = { success: boolean; brands?: Brand[] };
type CreateCategoryRes = { success: boolean; category?: { _id: string }; error?: string };
type CreateBrandRes = { success: boolean; brand?: { _id: string }; error?: string };

const initialMenuState = {
	name: "",
	nameBN: "",
	description: "",
	descriptionBN: "",
	imageFile: null as File | null,
};

const getInitialFormValues = (product: IProduct) => {
	return {
		title: product?.title || "",
		titleBN: product?.titleBN || "",
		description: product?.description || "",
		descriptionBN: product?.descriptionBN || "",
		unit: product?.unit || "pcs",
		stock: product?.stock || 0,
		price: product?.price || 0,
		salePrice: product?.salePrice !== undefined ? String(product.salePrice) : "",
		highlights: product?.highlights || "",
		highlightsBN: product?.highlightsBN || "",
		specification: product?.specification || "",
		specificationBN: product?.specificationBN || "",
		category: product?.category?._id ? String(product.category._id) : "",
		brand: product?.brand?._id ? String(product.brand._id) : "",
		sku: product?.sku || "",
		barcode: product?.barcode || "",
		weight: (product?.weight as unknown as string) || "",
		warranty: product?.warranty || "",
		warrantyBN: product?.warrantyBN || "",
		tags: product?.tags?.join(", ") || "",
		isActive: product?.isActive ?? true,
		isFeatured: product?.isFeatured ?? false,
	};
};

export default function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
	const [loading, setLoading] = useState(false);
	const [categories, setCategories] = useState<Category[]>([]);
	const [brands, setBrands] = useState<Brand[]>([]);
	const [formData, setFormData] = useState(() => getInitialFormValues(product as IProduct));
	const [images, setImages] = useState<File[]>([]);
	const [previewImages, setPreviewImages] = useState<string[]>(product?.gallery || []);
	const [categorySheetOpen, setCategorySheetOpen] = useState(false);
	const [brandSheetOpen, setBrandSheetOpen] = useState(false);
	const [quickCategory, setQuickCategory] = useState(initialMenuState);
	const [quickBrand, setQuickBrand] = useState(initialMenuState);

	// =============== fetch categories and brands ================
	useEffect(() => {
		const fetchData = async () => {
			try {
				const [categoriesResult, brandsResult] = (await Promise.all([getCategories(), getBrands()])) as [
					unknown,
					unknown
				];

				const categoryResponse = categoriesResult as CategoriesResult;
				const brandNameResponse = brandsResult as BrandsResult;

				if (categoryResponse.success) {
					setCategories(categoryResponse.categories ?? []);
				}

				if (brandNameResponse.success) {
					setBrands(brandNameResponse.brands ?? []);
				}
			} catch (error) {
				console.error("Failed to fetch form data:", error);
			}
		};

		fetchData();
	}, []);

	// =============== handle input change ================
	const handleInputChange = <K extends keyof typeof formData>(field: K, value: (typeof formData)[K]) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	// =============== quick add category ================
	const submitQuickCategory = async () => {
		try {
			const formData = new FormData();
			formData.append("name", quickCategory.name);
			formData.append("nameBN", quickCategory.nameBN);
			formData.append("description", quickCategory.description);
			formData.append("descriptionBN", quickCategory.descriptionBN);
			if (quickCategory.imageFile) formData.append("image", quickCategory.imageFile);
			const res = (await createCategoryQuick(formData)) as unknown as CreateCategoryRes;
			if (res.success) {
				// refresh list and set selected
				const cats = (await getCategories()) as unknown as CategoriesResult;
				if (cats.success) {
					setCategories(cats.categories ?? []);
					const createdId = res.category?._id;
					if (createdId) handleInputChange("category", createdId);
				}
				setCategorySheetOpen(false);
				setQuickCategory(initialMenuState);
				toast.success("Category created");
			} else {
				toast.error(res.error || "Failed to create category");
			}
		} catch (error) {
			console.error(error);
			toast.error("Failed to create category");
		}
	};

	// =============== quick add brand ================
	const submitQuickBrand = async () => {
		try {
			const formData = new FormData();
			formData.append("name", quickBrand.name);
			formData.append("nameBN", quickBrand.nameBN);
			formData.append("description", quickBrand.description);
			formData.append("descriptionBN", quickBrand.descriptionBN);
			if (quickBrand.imageFile) formData.append("image", quickBrand.imageFile);

			const res = (await createBrandQuick(formData)) as unknown as CreateBrandRes;

			if (res.success) {
				const brs = (await getBrands()) as unknown as BrandsResult;
				if (brs.success) {
					setBrands(brs.brands ?? []);
					const createdId = res.brand?._id;
					if (createdId) handleInputChange("brand", createdId);
				}
				setBrandSheetOpen(false);
				setQuickBrand(initialMenuState);
				toast.success("Brand created");
			} else {
				toast.error(res.error || "Failed to create brand");
			}
		} catch (error) {
			console.error(error);
			toast.error("Failed to create brand");
		}
	};

	// =============== handle image selection ================
	const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);
		const newImages = [...images, ...files];
		setImages(newImages);

		// Create preview URLs
		const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
		setPreviewImages((prev) => [...prev, ...newPreviewUrls]);
	};

	// =============== remove image ================
	const removeImage = (imageIndex: number) => {
		setImages((prev) => prev.filter((_, index) => index !== imageIndex));
		setPreviewImages((prev) => prev.filter((_, index) => index !== imageIndex));
	};

	// =============== remove existing image ================
	const removeExistingImage = (imageUrl: string) => {
		setPreviewImages((prev) => prev.filter((img) => img !== imageUrl));
	};

	// =============== handle form submission ================
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			const formDataObj = new FormData();

			Object.entries(formData).forEach(([key, value]) => {
				if (value !== undefined && value !== "") {
					formDataObj.append(key, value as string);
				}
			});

			// Add images
			images.forEach((image) => {
				formDataObj.append("images", image);
			});

			// Add existing images that weren't removed
			previewImages.forEach((imageUrl) => {
				if (imageUrl.startsWith("http")) {
					formDataObj.append("existingImages", imageUrl);
				}
			});

			const result = await onSubmit(formDataObj);

			if (result.success) {
				toast.success(product ? "Product updated successfully!" : "Product created successfully!");
				onCancel();
			} else {
				console.error("Failed to save product", result);
				toast.error(result.error || "Failed to save product");
			}
		} catch (error) {
			console.error(error);
			toast.error("An error occurred while saving the product");
		} finally {
			setLoading(false);
		}
	};

	// =============== generate SKU ================
	const generateSku = () => {
		const timestamp = Date.now().toString().slice(-6);
		const random = Math.random().toString(36).substring(2, 5).toUpperCase();
		const sku = `SKU-${timestamp}-${random}`;
		setFormData((prev) => ({ ...prev, sku }));
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Basic Information</CardTitle>
					<CardDescription>Essential product details</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="title">Product Title (English) *</Label>
							<Input
								id="title"
								value={formData.title}
								onChange={(e) => handleInputChange("title", e.target.value)}
								required
								placeholder="Enter product title"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="titleBN">Product Title (Bengali) *</Label>
							<Input
								id="titleBN"
								value={formData.titleBN}
								onChange={(e) => handleInputChange("titleBN", e.target.value)}
								required
								placeholder="Enter product title in Bengali"
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="space-y-2">
							<Label htmlFor="category">Category *</Label>
							<div className="flex gap-2">
								<div className="flex-1">
									<Select
										value={formData.category}
										onValueChange={(value) => handleInputChange("category", value)}
										required
									>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="Select category" />
										</SelectTrigger>
										<SelectContent>
											{categories.map((category) => (
												<SelectItem key={category._id} value={category._id}>
													{category.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<Button type="button" variant="outline" onClick={() => setCategorySheetOpen(true)}>
									<Plus className="h-4 w-4" />
								</Button>
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="brand">Brand *</Label>
							<div className="flex gap-2">
								<div className="flex-1">
									<Select
										value={formData.brand}
										onValueChange={(value) => handleInputChange("brand", value)}
										required
									>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="Select brand" />
										</SelectTrigger>
										<SelectContent>
											{brands.map((brand) => (
												<SelectItem key={brand._id} value={brand._id}>
													{brand.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<Button type="button" variant="outline" onClick={() => setBrandSheetOpen(true)}>
									<Plus className="h-4 w-4" />
								</Button>
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="unit">Unit *</Label>
							<Select
								value={formData.unit}
								onValueChange={(value) => handleInputChange("unit", value as ProductUnit)}
								required
							>
								<SelectTrigger className="w-full">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{UNITS.map((unit) => (
										<SelectItem key={unit.id} value={unit.value}>
											{unit.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="sku">SKU *</Label>
							<div className="flex gap-2">
								<Input
									id="sku"
									value={formData.sku}
									onChange={(e) => handleInputChange("sku", e.target.value)}
									required
									placeholder="Enter SKU"
								/>
								<Button
									type="button"
									variant="outline"
									onClick={generateSku}
									className="whitespace-nowrap"
								>
									Generate
								</Button>
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="barcode">Barcode</Label>
							<Input
								id="barcode"
								value={formData.barcode}
								onChange={(e) => handleInputChange("barcode", e.target.value)}
								placeholder="Enter barcode (optional)"
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Pricing & Stock */}
			<Card>
				<CardHeader>
					<CardTitle>Pricing & Stock</CardTitle>
					<CardDescription>Product pricing and inventory information</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="space-y-2">
							<Label htmlFor="price">Regular Price (৳) *</Label>
							<Input
								id="price"
								type="number"
								value={formData.price}
								onChange={(e) => handleInputChange("price", parseFloat(e.target.value) || 0)}
								required
								min="0"
								step="0.01"
								placeholder="0.00"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="salePrice">Sale Price (৳)</Label>
							<Input
								id="salePrice"
								type="number"
								value={formData.salePrice}
								onChange={(e) => handleInputChange("salePrice", e.target.value)}
								min="0"
								step="0.01"
								placeholder="0.00 (optional)"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="stock">Stock Quantity *</Label>
							<Input
								id="stock"
								type="number"
								value={formData.stock}
								onChange={(e) => handleInputChange("stock", parseInt(e.target.value) || 0)}
								required
								min="0"
								placeholder="0"
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="weight">Weight (kg)</Label>
							<Input
								id="weight"
								type="number"
								value={formData.weight}
								onChange={(e) => handleInputChange("weight", e.target.value)}
								min="0"
								step="0.01"
								placeholder="0.00 (optional)"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="tags">Tags</Label>
							<Input
								id="tags"
								value={formData.tags}
								onChange={(e) => handleInputChange("tags", e.target.value)}
								placeholder="Enter tags separated by commas"
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Descriptions */}
			<Card>
				<CardHeader>
					<CardTitle>Product Descriptions</CardTitle>
					<CardDescription>Detailed product information in multiple languages</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="description">Description (English) *</Label>
							<Textarea
								id="description"
								value={formData.description}
								onChange={(e) => handleInputChange("description", e.target.value)}
								required
								rows={4}
								placeholder="Enter product description"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="descriptionBN">Description (Bengali) *</Label>
							<Textarea
								id="descriptionBN"
								value={formData.descriptionBN}
								onChange={(e) => handleInputChange("descriptionBN", e.target.value)}
								required
								rows={4}
								placeholder="Enter product description in Bengali"
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="highlights">Highlights (English) *</Label>
							<Textarea
								id="highlights"
								value={formData.highlights}
								onChange={(e) => handleInputChange("highlights", e.target.value)}
								required
								rows={3}
								placeholder="Enter product highlights"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="highlightsBN">Highlights (Bengali) *</Label>
							<Textarea
								id="highlightsBN"
								value={formData.highlightsBN}
								onChange={(e) => handleInputChange("highlightsBN", e.target.value)}
								required
								rows={3}
								placeholder="Enter product highlights in Bengali"
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="specification">Specifications (English) *</Label>
							<Textarea
								id="specification"
								value={formData.specification}
								onChange={(e) => handleInputChange("specification", e.target.value)}
								required
								rows={4}
								placeholder="Enter product specifications"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="specificationBN">Specifications (Bengali) *</Label>
							<Textarea
								id="specificationBN"
								value={formData.specificationBN}
								onChange={(e) => handleInputChange("specificationBN", e.target.value)}
								required
								rows={4}
								placeholder="Enter product specifications in Bengali"
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="warranty">Warranty (English)</Label>
							<Input
								id="warranty"
								value={formData.warranty}
								onChange={(e) => handleInputChange("warranty", e.target.value)}
								placeholder="Enter warranty information"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="warrantyBN">Warranty (Bengali)</Label>
							<Input
								id="warrantyBN"
								value={formData.warrantyBN}
								onChange={(e) => handleInputChange("warrantyBN", e.target.value)}
								placeholder="Enter warranty information in Bengali"
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Product Images */}
			<Card>
				<CardHeader>
					<CardTitle>Product Images</CardTitle>
					<CardDescription>Upload product images (at least one required)</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="images">Upload Images</Label>
						<div className="flex items-center gap-2">
							<Input
								id="images"
								type="file"
								accept="image/*"
								multiple
								onChange={handleImageSelect}
								className="flex-1"
							/>
							<Button type="button" variant="outline" size="icon">
								<ImageIcon className="h-4 w-4" />
							</Button>
						</div>
						<p className="text-sm text-muted-foreground">
							Upload high-quality images to showcase your product
						</p>
					</div>

					{/* Image Previews */}
					{(previewImages.length > 0 || images.length > 0) && (
						<div className="space-y-3">
							<Label>Product Images</Label>
							<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
								{/* Existing images */}
								{previewImages
									.filter((img) => img.startsWith("http"))
									.map((imageUrl, index) => (
										<div key={`existing-${index}`} className="relative group">
											<Image
												src={imageUrl}
												alt={`Product image ${index + 1}`}
												width={200}
												height={200}
												className="w-full h-32 object-cover rounded-lg"
											/>
											<Button
												type="button"
												variant="destructive"
												size="sm"
												className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
												onClick={() => removeExistingImage(imageUrl)}
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									))}

								{/* New images */}
								{images.map((_, index) => (
									<div key={`new-${index}`} className="relative group">
										<Image
											src={previewImages[previewImages.length - images.length + index]}
											alt={`New image ${index + 1}`}
											width={200}
											height={200}
											className="w-full h-32 object-cover rounded-lg"
										/>
										<Button
											type="button"
											variant="destructive"
											size="sm"
											className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
											onClick={() => removeImage(index)}
										>
											<X className="h-4 w-4" />
										</Button>
									</div>
								))}
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Product Status */}
			<Card>
				<CardHeader>
					<CardTitle>Product Status</CardTitle>
					<CardDescription>Control product visibility and features</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center space-x-2">
						<Checkbox
							id="isActive"
							checked={formData.isActive}
							onCheckedChange={(checked) => handleInputChange("isActive", Boolean(checked))}
						/>
						<Label htmlFor="isActive">Active (visible to customers)</Label>
					</div>
					<div className="flex items-center space-x-2">
						<Checkbox
							id="isFeatured"
							checked={formData.isFeatured}
							onCheckedChange={(checked) => handleInputChange("isFeatured", Boolean(checked))}
						/>
						<Label htmlFor="isFeatured">Featured (highlighted on homepage)</Label>
					</div>
				</CardContent>
			</Card>

			{/* Form Actions */}
			<div className="flex justify-end gap-4">
				<Button type="button" variant="outline" onClick={onCancel}>
					Cancel
				</Button>
				<Button type="submit" disabled={loading}>
					{loading ? (
						<>
							<Loader2 className="h-4 w-4 mr-2 animate-spin" />
							Saving...
						</>
					) : (
						<>
							{product ? <Pencil className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
							{product ? "Update Product" : "Create Product"}
						</>
					)}
				</Button>
			</div>

			{/* =============== quick create category sheet ================ */}
			<Sheet open={categorySheetOpen} onOpenChange={setCategorySheetOpen}>
				<SheetContent side="right">
					<SheetHeader>
						<SheetTitle>Create Category</SheetTitle>
					</SheetHeader>
					<div className="space-y-3 p-4">
						<Label>Name</Label>
						<Input
							value={quickCategory.name}
							onChange={(e) => setQuickCategory({ ...quickCategory, name: e.target.value })}
						/>
						<Label>Name (BN)</Label>
						<Input
							value={quickCategory.nameBN}
							onChange={(e) => setQuickCategory({ ...quickCategory, nameBN: e.target.value })}
						/>
						<Label>Description</Label>
						<Textarea
							value={quickCategory.description}
							onChange={(e) => setQuickCategory({ ...quickCategory, description: e.target.value })}
						/>
						<Label>Description (BN)</Label>
						<Textarea
							value={quickCategory.descriptionBN}
							onChange={(e) => setQuickCategory({ ...quickCategory, descriptionBN: e.target.value })}
						/>
						<Label>Image</Label>
						<Input
							type="file"
							accept="image/*"
							onChange={(e) =>
								setQuickCategory({ ...quickCategory, imageFile: e.target.files?.[0] || null })
							}
						/>
						<div className="flex justify-end">
							<Button type="button" onClick={submitQuickCategory}>
								Save
							</Button>
						</div>
					</div>
				</SheetContent>
			</Sheet>

			{/* =============== quick create brand sheet ================ */}
			<Sheet open={brandSheetOpen} onOpenChange={setBrandSheetOpen}>
				<SheetContent side="right">
					<SheetHeader>
						<SheetTitle>Create Brand</SheetTitle>
					</SheetHeader>
					<div className="space-y-3 p-4">
						<Label>Name</Label>
						<Input
							value={quickBrand.name}
							onChange={(e) => setQuickBrand({ ...quickBrand, name: e.target.value })}
						/>
						<Label>Name (BN)</Label>
						<Input
							value={quickBrand.nameBN}
							onChange={(e) => setQuickBrand({ ...quickBrand, nameBN: e.target.value })}
						/>
						<Label>Description</Label>
						<Textarea
							value={quickBrand.description}
							onChange={(e) => setQuickBrand({ ...quickBrand, description: e.target.value })}
						/>
						<Label>Description (BN)</Label>
						<Textarea
							value={quickBrand.descriptionBN}
							onChange={(e) => setQuickBrand({ ...quickBrand, descriptionBN: e.target.value })}
						/>
						<Label>Image</Label>
						<Input
							type="file"
							accept="image/*"
							onChange={(e) => setQuickBrand({ ...quickBrand, imageFile: e.target.files?.[0] || null })}
						/>
						<div className="flex justify-end">
							<Button type="button" onClick={submitQuickBrand}>
								Save
							</Button>
						</div>
					</div>
				</SheetContent>
			</Sheet>
		</form>
	);
}
