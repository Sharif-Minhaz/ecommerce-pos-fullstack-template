import { z } from "zod";

export const quickBrandSchema = z.object({
	name: z.string().min(1, "name is required"),
	nameBN: z.string().optional(),
	description: z.string().optional(),
	descriptionBN: z.string().optional(),
});

export type QuickBrandValues = z.infer<typeof quickBrandSchema>;
