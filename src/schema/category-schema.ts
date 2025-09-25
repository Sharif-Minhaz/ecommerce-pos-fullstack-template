import { z } from "zod";

export const quickCategorySchema = z.object({
	name: z.string().min(1, "name is required"),
	nameBN: z.string().optional(),
	description: z.string().optional(),
	descriptionBN: z.string().optional(),
});

export type QuickCategoryValues = z.infer<typeof quickCategorySchema>;
