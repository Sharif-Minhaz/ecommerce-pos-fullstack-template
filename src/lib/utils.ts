import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function convertToPlaintObject(doc: any) {
	try {
		return JSON.parse(JSON.stringify(doc));
	} catch (err) {
		console.error("Error converting document to plain object:", err);
		return doc;
	}
}

export function showReadAbleCurrency(amount: number) {
	const formatted = amount.toLocaleString("en-IN", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});

	return formatted;
}
