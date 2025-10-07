import { z } from "zod";

export const quickCategorySchema = z.object({
	name: z.string().min(1, "name is required"),
	nameBN: z.string().optional(),
	description: z.string().optional(),
	descriptionBN: z.string().optional(),
});

export const categorySchema = z.object({
	name: z.string().min(1, "Category name in English is required"),
	nameBN: z.string().min(1, "Category name in Bengali is required"),
	description: z.string().min(1, "Description in English is required"),
	descriptionBN: z.string().min(1, "Description in Bengali is required"),
	image: z.any().refine((file) => file && file instanceof File, {
		message: "Category image is required",
	}),
});

export type QuickCategoryValues = z.infer<typeof quickCategorySchema>;
export type CategoryValues = z.infer<typeof categorySchema>;
