"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createBrand, updateBrand } from "@/app/actions/brand";
import { useRouter } from "next/navigation";
import { Upload, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

interface BrandFormProps {
	initialData?: {
		_id?: string;
		name?: string;
		nameBN?: string;
		description?: string;
		descriptionBN?: string;
		image?: string;
	};
	isEdit?: boolean;
}

export function BrandForm({ initialData, isEdit = false }: BrandFormProps) {
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
				result = await updateBrand(initialData._id, formData);
			} else {
				result = await createBrand(formData);
			}

			if (result.success) {
				toast.success(isEdit ? "Brand updated successfully!" : "Brand created successfully!");
				router.push("/my-shop/brands");
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
				{/* =============== brand name (english) ================ */}
				<div className="space-y-2">
					<Label htmlFor="name">Brand Name (English) *</Label>
					<Input
						id="name"
						name="name"
						type="text"
						defaultValue={initialData?.name || ""}
						required
						placeholder="Enter brand name in English"
					/>
				</div>

				{/* =============== brand name (bengali) ================ */}
				<div className="space-y-2">
					<Label htmlFor="nameBN">Brand Name (Bengali) *</Label>
					<Input
						id="nameBN"
						name="nameBN"
						type="text"
						defaultValue={initialData?.nameBN || ""}
						required
						placeholder="ব্র্যান্ডের নাম বাংলায়"
					/>
				</div>
			</div>

			{/* =============== brand description (english) ================ */}
			<div className="space-y-2">
				<Label htmlFor="description">Description (English) *</Label>
				<Textarea
					id="description"
					name="description"
					defaultValue={initialData?.description || ""}
					required
					placeholder="Describe your brand in English"
					rows={4}
				/>
			</div>

			{/* =============== brand description (bengali) ================ */}
			<div className="space-y-2">
				<Label htmlFor="descriptionBN">Description (Bengali) *</Label>
				<Textarea
					id="descriptionBN"
					name="descriptionBN"
					defaultValue={initialData?.descriptionBN || ""}
					required
					placeholder="আপনার ব্র্যান্ডের বর্ণনা বাংলায়"
					rows={4}
				/>
			</div>

			{/* =============== brand image upload ================ */}
			<div className="space-y-2">
				<Label htmlFor="image">Brand Image {!isEdit && "*"}</Label>
				<div className="space-y-4">
					{/* =============== image preview ================ */}
					{imagePreview && (
						<div className="relative w-48 h-32 border rounded-lg overflow-hidden">
							<Image src={imagePreview} alt="Brand preview" fill className="object-contain" />
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
					{isEdit ? "Update Brand" : "Create Brand"}
				</Button>
				<Button
					type="button"
					variant="outline"
					onClick={() => router.push("/my-shop/brands")}
					disabled={isLoading}
				>
					Cancel
				</Button>
			</div>
		</form>
	);
}
