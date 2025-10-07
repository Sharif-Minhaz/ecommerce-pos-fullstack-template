"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { Loader2, Plus, X, Image as ImageIcon, Trash2, Pencil } from "lucide-react";
import Image from "next/image";
import { IProduct, ProductUnit } from "@/types/product";
import { getCategories } from "@/app/actions/category";
import { getBrands } from "@/app/actions/brand";
import { UNITS } from "@/constant";
import { productSchema } from "@/schema/product-schema";
import { IBrand } from "@/types/brand";
import { ICategory } from "@/types/category";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import QuickBrandForm from "./QuickBrandForm";
import QuickCategoryForm from "./QuickCategoryForm";

interface ProductFormProps {
	product?: IProduct;
	onSubmit: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
	onCancel: () => void;
}

export type BrandsResult = { success: boolean; brands?: IBrand[] };
export type CategoriesResult = { success: boolean; categories?: ICategory[] };

// =============== we extend server schema to accept boolean flags client-side ================
const clientProductSchema = productSchema.extend({
	isActive: z.boolean().optional(),
	isFeatured: z.boolean().optional(),
});

export type ProductFormValues = z.infer<typeof clientProductSchema>;

type FormState = {
	message: string;
	fieldErrors: Record<string, string | undefined>;
};

const generateBarcode = () => {
	return `${Date.now().toString(36).toUpperCase()}`;
};

const generateSku = () => {
	const timestamp = Date.now().toString().slice(-6);
	const random = Math.random().toString(36).substring(2, 5).toUpperCase();
	const sku = `SKU-${timestamp}-${random}`;
	return sku;
};

const getInitialFormValues = (product: IProduct) => {
	return {
		title: product?.title || "",
		titleBN: product?.titleBN || "",
		description: product?.description || "",
		descriptionBN: product?.descriptionBN || "",
		unit: (product?.unit as ProductUnit) || "pcs",
		stock: product?.stock || 0,
		price: product?.price || 0,
		salePrice: product?.salePrice ?? undefined,
		highlights: product?.highlights || "",
		highlightsBN: product?.highlightsBN || "",
		specification: product?.specification || "",
		specificationBN: product?.specificationBN || "",
		category: product?.category?._id ? String(product.category._id) : "",
		brand: product?.brand?._id ? String(product.brand._id) : "",
		sku: product?.sku || generateSku(),
		barcode: product?.barcode || generateBarcode(),
		weight: (product?.weight as number | undefined) ?? undefined,
		warranty: product?.warranty || "",
		warrantyBN: product?.warrantyBN || "",
		tags: product?.tags?.join(", ") || "",
		isActive: product?.isActive ?? true,
		isFeatured: product?.isFeatured ?? false,
	};
};

export default function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
	const form = useForm<ProductFormValues, unknown, ProductFormValues>({
		resolver: zodResolver(clientProductSchema) as unknown as import("react-hook-form").Resolver<ProductFormValues>,
		defaultValues: {
			...getInitialFormValues(product as IProduct),
		},
	});
	const [categories, setCategories] = useState<ICategory[]>([]);
	const [brands, setBrands] = useState<IBrand[]>([]);
	const [images, setImages] = useState<File[]>([]);

	const [previewImages, setPreviewImages] = useState<string[]>(
		Array.isArray(product?.gallery)
			? (product!.gallery as unknown as Array<string | { url: string }>)?.map((gallery) =>
					typeof gallery === "string" ? gallery : gallery.url
			  )
			: []
	);
	const [categorySheetOpen, setCategorySheetOpen] = useState(false);
	const [brandSheetOpen, setBrandSheetOpen] = useState(false);

	// =============== useActionState to handle submission and errors ================
	async function handleFormAction(formData: FormData): Promise<FormState> {
		try {
			// build raw values from form data for validation
			const raw = Object.fromEntries(formData);
			raw.isActive = raw.isActive ?? (raw.isActive ? "true" : "false");
			raw.isFeatured = raw.isFeatured ?? (raw.isFeatured ? "true" : "false");

			const validated = productSchema.safeParse(raw);

			if (!validated.success) {
				const fieldErrors: Record<string, string | undefined> = {};
				const flat = validated.error.flatten().fieldErrors;

				for (const key in flat) {
					const first = (flat as Record<string, string[]>)[key]?.[0];
					if (first) fieldErrors[key] = first;
				}

				toast("Form validation failed", {
					classNames: {
						title: "!text-red-500",
						cancelButton: "!bg-red-500 !text-white",
					},
					description: "please fix the highlighted errors",
					position: "top-center",
					cancel: {
						label: "Close",
						onClick: () => console.log("Close"),
					},
				});

				return { message: "please fix the highlighted errors", fieldErrors };
			}

			// include existing images that were not removed
			previewImages
				.filter((img) => img.startsWith("http"))
				.forEach((url) => formData.append("existingImages", url));

			const result = await onSubmit(formData);
			if (!result.success) {
				return { message: result.error || "failed to save product", fieldErrors: {} };
			}
			return { message: "", fieldErrors: {} };
		} catch (err) {
			console.error(err);
			return { message: "unexpected error occurred", fieldErrors: {} };
		}
	}

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

	// =============== rhf submit handler: builds FormData and delegates to useActionState ================
	const onSubmitHandler = async (values: ProductFormValues) => {
		try {
			const formData = new FormData();
			Object.entries(values as Record<string, unknown>).forEach(([key, val]) => {
				if (val === undefined || val === null) return;
				if (typeof val === "boolean") {
					formData.append(key, val ? "true" : "false");
				} else {
					formData.append(key, String(val));
				}
			});

			// include existing images that were not removed
			previewImages
				.filter((img) => img.startsWith("http"))
				.forEach((url) => formData.append("existingImages", url));

			// append newly selected images
			images.forEach((file) => formData.append("images", file));

			await handleFormAction(formData);
		} catch (e) {
			console.error(e);
			toast.error("failed to submit form");
		}
	};

	return (
		<>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Basic Information</CardTitle>
							<CardDescription>Essential product details</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name={"title"}
									render={({ field }) => (
										<FormItem>
											<FormLabel>Product Title (English) *</FormLabel>
											<FormControl>
												<Input placeholder="Enter product title" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name={"titleBN"}
									render={({ field }) => (
										<FormItem>
											<FormLabel>Product Title (Bengali) *</FormLabel>
											<FormControl>
												<Input placeholder="Enter product title in Bengali" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<FormField
									control={form.control}
									name={"category"}
									render={({ field }) => (
										<FormItem>
											<FormLabel>Category *</FormLabel>
											<div className="flex gap-2">
												<div className="flex-1">
													<Select
														value={field.value as string}
														onValueChange={field.onChange}
													>
														<SelectTrigger className="w-full">
															<SelectValue placeholder="Select category" />
														</SelectTrigger>
														<SelectContent>
															{categories.map((category, index) => (
																<SelectItem
																	key={(category._id as string) || index}
																	value={category._id as string}
																>
																	{category.name}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
												</div>
												<Button
													type="button"
													variant="outline"
													onClick={() => setCategorySheetOpen(true)}
												>
													<Plus className="h-4 w-4" />
												</Button>
											</div>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name={"brand"}
									render={({ field }) => (
										<FormItem>
											<FormLabel>Brand *</FormLabel>
											<div className="flex gap-2">
												<div className="flex-1">
													<Select
														value={field.value as string}
														onValueChange={field.onChange}
													>
														<SelectTrigger className="w-full">
															<SelectValue placeholder="Select brand" />
														</SelectTrigger>
														<SelectContent>
															{brands.map((brand) => (
																<SelectItem
																	key={brand._id as string}
																	value={brand._id as string}
																>
																	{brand.name}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
												</div>
												<Button
													type="button"
													variant="outline"
													onClick={() => setBrandSheetOpen(true)}
												>
													<Plus className="h-4 w-4" />
												</Button>
											</div>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name={"unit"}
									render={({ field }) => (
										<FormItem>
											<FormLabel>Unit *</FormLabel>
											<Select
												value={field.value as string}
												onValueChange={(v) => field.onChange(v as ProductUnit)}
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
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name={"sku"}
									render={({ field }) => (
										<FormItem>
											<FormLabel>SKU *</FormLabel>
											<div className="flex gap-2">
												<FormControl>
													<Input placeholder="Enter SKU" {...field} />
												</FormControl>
												<Button
													type="button"
													variant="outline"
													onClick={() => form.setValue("sku", generateSku())}
													className="whitespace-nowrap"
												>
													Generate
												</Button>
											</div>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name={"barcode"}
									render={({ field }) => (
										<FormItem>
											<FormLabel>Barcode</FormLabel>
											<div className="flex gap-2">
												<FormControl>
													<Input placeholder="Enter barcode (optional)" {...field} />
												</FormControl>
												<Button
													type="button"
													variant="outline"
													onClick={() => form.setValue("barcode", generateBarcode())}
													className="whitespace-nowrap"
												>
													Generate
												</Button>
											</div>
											<FormMessage />
										</FormItem>
									)}
								/>
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
								<FormField
									control={form.control}
									name={"price"}
									render={({ field }) => (
										<FormItem>
											<FormLabel>Regular Price (৳) *</FormLabel>
											<FormControl>
												<Input
													id="price"
													type="number"
													min="0"
													step="0.01"
													placeholder="0.00"
													value={field.value as number}
													onChange={(e) =>
														field.onChange(
															e.target.value === "" ? 0 : Number(e.target.value)
														)
													}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name={"salePrice"}
									render={({ field }) => (
										<FormItem>
											<FormLabel>Sale Price (৳)</FormLabel>
											<FormControl>
												<Input
													id="salePrice"
													type="number"
													min="0"
													step="0.01"
													placeholder="0.00 (optional)"
													value={(field.value as number | undefined) ?? ""}
													onChange={(e) =>
														field.onChange(
															e.target.value === "" ? undefined : Number(e.target.value)
														)
													}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name={"stock"}
									render={({ field }) => (
										<FormItem>
											<FormLabel>Stock Quantity *</FormLabel>
											<FormControl>
												<Input
													id="stock"
													type="number"
													min="0"
													placeholder="0"
													value={field.value as number}
													onChange={(e) =>
														field.onChange(
															e.target.value === "" ? 0 : Number(e.target.value)
														)
													}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name={"weight"}
									render={({ field }) => (
										<FormItem>
											<FormLabel>Weight (kg)</FormLabel>
											<FormControl>
												<Input
													id="weight"
													type="number"
													min="0"
													step="0.01"
													placeholder="0.00 (optional)"
													value={(field.value as number | undefined) ?? ""}
													onChange={(e) =>
														field.onChange(
															e.target.value === "" ? undefined : Number(e.target.value)
														)
													}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name={"tags"}
									render={({ field }) => (
										<FormItem>
											<FormLabel>Tags</FormLabel>
											<FormControl>
												<Input
													id="tags"
													placeholder="Enter tags separated by commas"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
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
								<FormField
									control={form.control}
									name={"description"}
									render={({ field }) => (
										<FormItem>
											<FormLabel>Description (English) *</FormLabel>
											<FormControl>
												<Textarea rows={4} placeholder="Enter product description" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name={"descriptionBN"}
									render={({ field }) => (
										<FormItem>
											<FormLabel>Description (Bengali) *</FormLabel>
											<FormControl>
												<Textarea
													rows={4}
													placeholder="Enter product description in Bengali"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name={"highlights"}
									render={({ field }) => (
										<FormItem>
											<FormLabel>Highlights (English) *</FormLabel>
											<FormControl>
												<Textarea rows={3} placeholder="Enter product highlights" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name={"highlightsBN"}
									render={({ field }) => (
										<FormItem>
											<FormLabel>Highlights (Bengali) *</FormLabel>
											<FormControl>
												<Textarea
													rows={3}
													placeholder="Enter product highlights in Bengali"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name={"specification"}
									render={({ field }) => (
										<FormItem>
											<FormLabel>Specifications (English) *</FormLabel>
											<FormControl>
												<Textarea
													rows={4}
													placeholder="Enter product specifications"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name={"specificationBN"}
									render={({ field }) => (
										<FormItem>
											<FormLabel>Specifications (Bengali) *</FormLabel>
											<FormControl>
												<Textarea
													rows={4}
													placeholder="Enter product specifications in Bengali"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name={"warranty"}
									render={({ field }) => (
										<FormItem>
											<FormLabel>Warranty (English)</FormLabel>
											<FormControl>
												<Input placeholder="Enter warranty information" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name={"warrantyBN"}
									render={({ field }) => (
										<FormItem>
											<FormLabel>Warranty (Bengali)</FormLabel>
											<FormControl>
												<Input placeholder="Enter warranty information in Bengali" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
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
										name="images"
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
										{images?.map((_, index) => (
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
							<FormField
								control={form.control}
								name={"isActive"}
								render={({ field }) => (
									<FormItem className="flex flex-row items-center space-x-2 space-y-0">
										<FormControl>
											<Checkbox
												id="isActive"
												checked={Boolean(field.value)}
												onCheckedChange={(v) => field.onChange(Boolean(v))}
											/>
										</FormControl>
										<FormLabel htmlFor="isActive" className="!mb-0">
											Active (visible to customers)
										</FormLabel>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name={"isFeatured"}
								render={({ field }) => (
									<FormItem className="flex flex-row items-center space-x-2 space-y-0">
										<FormControl>
											<Checkbox
												id="isFeatured"
												checked={Boolean(field.value)}
												onCheckedChange={(v) => field.onChange(Boolean(v))}
											/>
										</FormControl>
										<FormLabel htmlFor="isFeatured" className="!mb-0">
											Featured (highlighted on homepage)
										</FormLabel>
										<FormMessage />
									</FormItem>
								)}
							/>
						</CardContent>
					</Card>

					{/* Form Actions */}
					<div className="flex justify-end gap-4">
						<Button type="button" variant="outline" onClick={onCancel}>
							Cancel
						</Button>
						<Button type="submit" disabled={form.formState.isSubmitting}>
							{form.formState.isSubmitting ? (
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
				</form>
			</Form>

			{/* =============== quick create category sheet ================ */}
			<QuickCategoryForm
				productForm={form}
				setCategories={setCategories}
				categorySheetOpen={categorySheetOpen}
				setCategorySheetOpen={setCategorySheetOpen}
			/>

			{/* =============== quick create brand sheet ================ */}
			<QuickBrandForm
				productForm={form}
				setBrands={setBrands}
				brandSheetOpen={brandSheetOpen}
				setBrandSheetOpen={setBrandSheetOpen}
			/>
		</>
	);
}
