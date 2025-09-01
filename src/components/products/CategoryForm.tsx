"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createCategory, updateCategory } from "@/app/actions/category";
import { useRouter } from "next/navigation";
import { Upload, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

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

	// =============== handle form submission ================
	const handleSubmit = async (formData: FormData) => {
		setIsLoading(true);

		try {
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
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	return (
		<form action={handleSubmit} className="space-y-6">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* =============== category name (english) ================ */}
				<div className="space-y-2">
					<Label htmlFor="name">Category Name (English) *</Label>
					<Input
						id="name"
						name="name"
						type="text"
						defaultValue={initialData?.name || ""}
						required
						placeholder="Enter category name in English"
					/>
				</div>

				{/* =============== category name (bengali) ================ */}
				<div className="space-y-2">
					<Label htmlFor="nameBN">Category Name (Bengali) *</Label>
					<Input
						id="nameBN"
						name="nameBN"
						type="text"
						defaultValue={initialData?.nameBN || ""}
						required
						placeholder="ক্যাটেগরির নাম বাংলায়"
					/>
				</div>
			</div>

			{/* =============== category description (english) ================ */}
			<div className="space-y-2">
				<Label htmlFor="description">Description (English) *</Label>
				<Textarea
					id="description"
					name="description"
					defaultValue={initialData?.description || ""}
					required
					placeholder="Describe your category in English"
					rows={4}
				/>
			</div>

			{/* =============== category description (bengali) ================ */}
			<div className="space-y-2">
				<Label htmlFor="descriptionBN">Description (Bengali) *</Label>
				<Textarea
					id="descriptionBN"
					name="descriptionBN"
					defaultValue={initialData?.descriptionBN || ""}
					required
					placeholder="আপনার ক্যাটেগরির বর্ণনা বাংলায়"
					rows={4}
				/>
			</div>

			{/* =============== category image upload ================ */}
			<div className="space-y-2">
				<Label htmlFor="image">Category Image {!isEdit && "*"}</Label>
				<div className="space-y-4">
					{/* =============== image preview ================ */}
					{imagePreview && (
						<div className="relative w-48 h-32 border rounded-lg overflow-hidden">
							<Image src={imagePreview} alt="Category preview" fill className="object-cover" />
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
						<input
							ref={fileInputRef}
							id="image"
							name="image"
							type="file"
							accept="image/*"
							onChange={handleImageChange}
							className="hidden"
							required={!isEdit && !imagePreview}
						/>
						<span className="text-sm text-gray-500">PNG, JPG, WEBP up to 5MB</span>
					</div>
				</div>
			</div>

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
	);
}
