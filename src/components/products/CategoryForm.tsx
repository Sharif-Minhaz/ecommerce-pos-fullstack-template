"use client";

import { useState, useRef } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createCategory, updateCategory } from "@/app/actions/category";
import { useRouter } from "next/navigation";
import { Upload, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categorySchema, CategoryValues } from "@/schema/category-schema";

interface CategoryFormProps {
	initialData?: {
		_id?: string;
		name?: string;
		nameBN?: string;
		description?: string;
		descriptionBN?: string;
		image?: string;
		parent?: { _id: string; name: string } | string;
	};
	parentOptions?: {
		_id: string;
		name: string;
	}[];
	isEdit?: boolean;
}

export function CategoryForm({ initialData, isEdit = false }: CategoryFormProps) {
	const router = useRouter();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image || null);

	const form = useForm<CategoryValues>({
		resolver: zodResolver(categorySchema),
		defaultValues: {
			name: initialData?.name || "",
			nameBN: initialData?.nameBN || "",
			description: initialData?.description || "",
			descriptionBN: initialData?.descriptionBN || "",
			image: undefined,
		},
	});

	// =============== handle form submission ================
	const onSubmit = async (data: CategoryValues) => {
		setIsLoading(true);

		try {
			// =============== create form data ================
			const formData = new FormData();
			formData.append("name", data.name);
			formData.append("nameBN", data.nameBN);
			formData.append("description", data.description);
			formData.append("descriptionBN", data.descriptionBN);

			// =============== add image only if it's a new file ================
			if (data.image && data.image instanceof File) {
				formData.append("image", data.image);
			}

			let result;
			if (isEdit && initialData?._id) {
				result = await updateCategory(initialData._id, formData);
			} else {
				result = await createCategory(formData);
			}

			if (result.success) {
				toast.success(isEdit ? "Category updated successfully!" : "Category created successfully!");
				router.push("/my-shop/categories");
			} else {
				toast.error(result.error || "Something went wrong");
			}
		} catch {
			toast.error("An unexpected error occurred");
		} finally {
			setIsLoading(false);
		}
	};

	// =============== handle image change ================
	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			// =============== update form field ================
			form.setValue("image", file);

			// =============== update preview ================
			const reader = new FileReader();
			reader.onload = () => {
				setImagePreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	// =============== remove image preview ================
	const removeImage = () => {
		setImagePreview(null);
		form.setValue("image", undefined);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{/* =============== category name (english) ================ */}
					<FormField
						control={form.control}
						name={"name"}
						render={({ field }) => (
							<FormItem>
								<FormLabel htmlFor="name">Category Name (English) *</FormLabel>
								<FormControl>
									<Input
										id="name"
										type="text"
										placeholder="Enter category name in English"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* =============== category name (bengali) ================ */}
					<FormField
						control={form.control}
						name={"nameBN"}
						render={({ field }) => (
							<FormItem>
								<FormLabel htmlFor="nameBN">Category Name (Bengali) *</FormLabel>
								<FormControl>
									<Input id="nameBN" type="text" placeholder="ক্যাটেগরির নাম বাংলায়" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				{/* =============== category description (english) ================ */}
				<FormField
					control={form.control}
					name={"description"}
					render={({ field }) => (
						<FormItem className="space-y-2">
							<FormLabel htmlFor="description">Description (English) *</FormLabel>
							<FormControl>
								<Textarea
									id="description"
									placeholder="Describe your category in English"
									rows={4}
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* =============== category description (bengali) ================ */}
				<FormField
					control={form.control}
					name={"descriptionBN"}
					render={({ field }) => (
						<FormItem className="space-y-2">
							<FormLabel htmlFor="descriptionBN">Description (Bengali) *</FormLabel>
							<FormControl>
								<Textarea
									id="descriptionBN"
									placeholder="আপনার ক্যাটেগরির বর্ণনা বাংলায়"
									rows={4}
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* =============== category image upload ================ */}
				<FormField
					control={form.control}
					name="image"
					render={() => (
						<FormItem>
							<FormLabel htmlFor="image">Category Image {!isEdit && "*"}</FormLabel>
							<FormControl>
								<div className="space-y-4">
									{/* =============== image preview ================ */}
									{imagePreview && (
										<div className="relative w-48 h-32 border rounded-lg overflow-hidden">
											<Image
												src={imagePreview}
												alt="Category preview"
												fill
												className="object-cover"
											/>
											<button
												type="button"
												onClick={removeImage}
												className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
											>
												<X className="w-4 h-4" />
											</button>
										</div>
									)}

									{/* =============== file input ================ */}
									<div className="flex items-center gap-4">
										<Button
											type="button"
											variant="outline"
											onClick={() => fileInputRef.current?.click()}
											className="flex items-center gap-2"
										>
											<Upload className="w-4 h-4" />
											{imagePreview ? "Change Image" : "Upload Image"}
										</Button>
										<Input
											ref={fileInputRef}
											id="image"
											name="image"
											type="file"
											accept="image/*"
											onChange={handleImageChange}
											className="hidden"
										/>
										<span className="text-sm text-gray-500">PNG, JPG, WEBP up to 5MB</span>
									</div>
								</div>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* =============== submit buttons ================ */}
				<div className="flex gap-4 pt-6">
					<Button type="submit" disabled={isLoading} className="flex items-center gap-2">
						{isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
						{isEdit ? "Update Category" : "Create Category"}
					</Button>
					<Button
						type="button"
						variant="outline"
						onClick={() => router.push("/my-shop/categories")}
						disabled={isLoading}
					>
						Cancel
					</Button>
				</div>
			</form>
		</Form>
	);
}
