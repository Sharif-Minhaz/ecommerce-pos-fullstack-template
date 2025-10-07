import { z } from "zod";

export const quickBrandSchema = z.object({
	name: z.string().min(1, "name is required"),
	nameBN: z.string().optional(),
	description: z.string().optional(),
	descriptionBN: z.string().optional(),
});

export const brandSchema = z.object({
	name: z.string().min(1, "Brand name in English is required"),
	nameBN: z.string().min(1, "Brand name in Bengali is required"),
	description: z.string().min(1, "Description in English is required"),
	descriptionBN: z.string().min(1, "Description in Bengali is required"),
	image: z.any().refine((file) => file && file instanceof File, {
		message: "Brand image is required",
	}),
});

export type QuickBrandValues = z.infer<typeof quickBrandSchema>;
export type BrandValues = z.infer<typeof brandSchema>;
