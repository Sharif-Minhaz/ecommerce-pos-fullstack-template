"use client";

import { Form, FormControl, FormLabel, FormItem, FormField, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { useForm, UseFormReturn } from "react-hook-form";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sheet, SheetTitle, SheetHeader, SheetContent } from "../ui/sheet";
import { toast } from "sonner";
import { createBrandQuick, getBrands } from "@/app/actions/brand";
import { useState } from "react";
import { quickBrandSchema, type QuickBrandValues } from "@/schema/brand-schema";
import { IBrand } from "@/types/brand";
import { ProductFormValues } from "./ProductForm";

type CreateBrandRes = { success: boolean; brand?: { _id: string }; error?: string };
type BrandsResult = { success: boolean; brands?: IBrand[] };

export default function QuickBrandForm({
	productForm,
	setBrands,
	brandSheetOpen,
	setBrandSheetOpen,
}: {
	productForm: UseFormReturn<ProductFormValues>;
	setBrands: (brands: IBrand[]) => void;
	brandSheetOpen: boolean;
	setBrandSheetOpen: (open: boolean) => void;
}) {
	const [quickBrandImage, setQuickBrandImage] = useState<File | null>(null);

	const form = useForm<QuickBrandValues>({
		resolver: zodResolver(quickBrandSchema),
		defaultValues: { name: "", nameBN: "", description: "", descriptionBN: "" },
	});

	const submitQuickBrand = async (values: QuickBrandValues) => {
		try {
			const formData = new FormData();
			Object.entries(values).forEach(([key, value]) => {
				if (value) formData.append(key, value as string);
			});
			if (quickBrandImage) formData.append("image", quickBrandImage);

			const res = (await createBrandQuick(formData)) as unknown as CreateBrandRes;

			if (res.success) {
				const brs = (await getBrands()) as unknown as BrandsResult;
				if (brs.success) {
					setBrands(brs.brands ?? []);
					const createdId = res.brand?._id;
					if (createdId) productForm.setValue("brand", createdId);
				}
				setBrandSheetOpen(false);
				form.reset();
				setQuickBrandImage(null);
				toast.success("Brand created");
			} else {
				toast.error(res.error || "Failed to create brand");
			}
		} catch (error) {
			console.error(error);
			toast.error("Failed to create brand");
		}
	};

	return (
		<Sheet open={brandSheetOpen} onOpenChange={setBrandSheetOpen}>
			<SheetContent side="right">
				<SheetHeader>
					<SheetTitle>Create Brand</SheetTitle>
				</SheetHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(submitQuickBrand)} className="space-y-3 p-4">
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
								onChange={(e) => setQuickBrandImage(e.target.files?.[0] ?? null)}
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
