import { z } from "zod";
import { UNITS } from "@/constant";

export const productSchema = z.object({
	title: z.string().min(1, "title is required"),
	titleBN: z.string().min(1, "bengali title is required"),
	description: z.string().min(1, "description is required"),
	descriptionBN: z.string().min(1, "bengali description is required"),
	unit: z.string().refine((val) => UNITS.some((u) => u.value === val), {
		message: "invalid unit",
	}),
	stock: z.coerce.number().int().min(0, "stock must be 0 or more"),
	price: z.coerce.number().gt(0, "price must be greater than 0"),
	salePrice: z.preprocess(
		(val) => (val === "" || val === undefined ? undefined : val),
		z.coerce.number().gte(0, "sale price must be 0 or more").optional()
	),
	highlights: z.string().min(1, "highlights are required"),
	highlightsBN: z.string().min(1, "bengali highlights are required"),
	specification: z.string().min(1, "specification is required"),
	specificationBN: z.string().min(1, "bengali specification is required"),
	category: z.string().min(1, "category is required"),
	brand: z.string().min(1, "brand is required"),
	sku: z.string().min(1, "sku is required"),
	barcode: z.string().optional(),
	weight: z.preprocess(
		(val) => (val === "" || val === undefined ? undefined : val),
		z.coerce.number().gte(0, "weight must be 0 or more").optional()
	),
	warranty: z.string().optional(),
	warrantyBN: z.string().optional(),
	tags: z.string().optional(),
	isActive: z.enum(["true", "false"]).optional(),
	isFeatured: z.enum(["true", "false"]).optional(),
});
