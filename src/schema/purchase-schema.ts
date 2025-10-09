import { z } from "zod";

export const purchaseFormSchema = z.object({
	supplierName: z.string().min(1, "Supplier name is required"),
	phone: z.string().regex(/^[+\d\s\-()]{6,}$/, "Please enter a valid phone number"),
	address: z.string().min(3, "Address must be at least 3 characters long"),
	city: z.string().min(1, "City is required"),
	postalCode: z.string().min(1, "Postal code is required"),
	country: z.string().default("Bangladesh").optional().or(z.literal("")),
	shopName: z.string().min(1, "Shop name is required"),
	email: z.string().email("Invalid email").optional().or(z.literal("")),

	deliveryCharge: z.coerce.number().min(0).default(0),
	discount: z.coerce.number().min(0).default(0),
	discountType: z.enum(["flat", "percentage"]).default("flat"),
	vat: z.coerce.number().min(0).default(0),
	paid: z.coerce.number().min(0).default(0),

	notes: z.string().optional().or(z.literal("")),
});

export type PurchaseFormValues = z.infer<typeof purchaseFormSchema>;
