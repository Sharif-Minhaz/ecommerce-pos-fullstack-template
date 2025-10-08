import { z } from "zod";

export const shopSchema = z.object({
	shopName: z.string().min(1, "shop name is required").min(2, "shop name must be at least 2 characters"),
	shopDescription: z
		.string()
		.min(1, "shop description is required")
		.min(10, "shop description must be at least 10 characters"),
	registrationNumber: z
		.string()
		.min(1, "registration number is required")
		.min(5, "registration number must be at least 5 characters"),
});

export type ShopValues = z.infer<typeof shopSchema>;
