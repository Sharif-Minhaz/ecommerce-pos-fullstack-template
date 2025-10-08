import { z } from "zod";

export const salesFormSchema = z.object({
	customerName: z.string().min(1, "Customer name is Required"),
	customerPhone: z.string().optional().or(z.literal("")),
	customerEmail: z.string().email("Invalid email").optional().or(z.literal("")),
	customerAddress: z.string().optional().or(z.literal("")),
	customerCity: z.string().optional().or(z.literal("")),
	customerPostalCode: z.string().optional().or(z.literal("")),
	saleNotes: z.string().optional().or(z.literal("")),
	deliveryCharge: z.coerce.number().min(0).default(0),
	discount: z.coerce.number().min(0).default(0),
	taxAmount: z.coerce.number().min(0).default(0),
	totalOverride: z.string().optional().or(z.literal("")),
});

export type SalesFormValues = z.infer<typeof salesFormSchema>;
