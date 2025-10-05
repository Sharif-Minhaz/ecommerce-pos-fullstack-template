"use client";

import React, { useState } from "react";
import { Form, FormMessage, FormControl, FormLabel, FormItem, FormField } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Sheet, SheetHeader, SheetTitle, SheetContent } from "../ui/sheet";
import { ICategory } from "@/types/category";
import { quickCategorySchema, type QuickCategoryValues } from "@/schema/category-schema";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCategoryQuick, getCategories } from "@/app/actions/category";
import { toast } from "sonner";
import { ProductFormValues } from "./ProductForm";

type CreateCategoryRes = { success: boolean; category?: { _id: string }; error?: string };
type CategoriesResult = { success: boolean; categories?: ICategory[] };

export default function QuickCategoryForm({
	productForm,
	categorySheetOpen,
	setCategorySheetOpen,
	setCategories,
}: {
	productForm: UseFormReturn<ProductFormValues>;
	categorySheetOpen: boolean;
	setCategorySheetOpen: (open: boolean) => void;
	setCategories: (categories: ICategory[]) => void;
}) {
	const [quickCategoryImage, setQuickCategoryImage] = useState<File | null>(null);

	const form = useForm<QuickCategoryValues>({
		resolver: zodResolver(quickCategorySchema),
		defaultValues: { name: "", nameBN: "", description: "", descriptionBN: "" },
	});

	const submitQuickCategory = async (values: QuickCategoryValues) => {
		try {
			const formData = new FormData();
			Object.entries(values).forEach(([key, value]) => {
				if (value) formData.append(key, value as string);
			});
			if (quickCategoryImage) formData.append("image", quickCategoryImage);

			const res = (await createCategoryQuick(formData)) as unknown as CreateCategoryRes;
			if (res.success) {
				// refresh list and set selected
				const cats = (await getCategories()) as unknown as CategoriesResult;
				if (cats.success) {
					setCategories(cats.categories ?? []);
					const createdId = res.category?._id;
					// select the newly created category in the product form
					if (createdId) productForm.setValue("category", createdId);
				}
				setCategorySheetOpen(false);
				form.reset();
				setQuickCategoryImage(null);
				toast.success("Category created");
			} else {
				toast.error(res.error || "Failed to create category");
			}
		} catch (error) {
			console.error(error);
			toast.error("Failed to create category");
		}
	};

	return (
		<Sheet open={categorySheetOpen} onOpenChange={setCategorySheetOpen}>
			<SheetContent side="right">
				<SheetHeader>
					<SheetTitle>Create Category</SheetTitle>
				</SheetHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(submitQuickCategory)} className="space-y-3 p-4">
						<FormField
							control={form.control}
							name={"name"}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name={"nameBN"}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name (BN)</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name={"description"}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Description</FormLabel>
									<FormControl>
										<Textarea {...field} />
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
									<FormLabel>Description (BN)</FormLabel>
									<FormControl>
										<Textarea {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div>
							<Label>Image</Label>
							<Input
								type="file"
								accept="image/*"
								onChange={(e) => setQuickCategoryImage(e.target.files?.[0] ?? null)}
							/>
						</div>
						<div className="flex justify-end">
							<Button type="submit" disabled={form.formState.isSubmitting}>
								Save
							</Button>
						</div>
					</form>
				</Form>
			</SheetContent>
		</Sheet>
	);
}
