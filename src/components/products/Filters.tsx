"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter, useSearchParams } from "next/navigation";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";

interface FiltersProps {
	search: string;
	inStock: boolean;
	priceRange: [number, number];
	minPrice: number;
	maxPrice: number;
	categories: { name: string; slug: string }[];
	selectedCategories: string[];
	brands: { name: string; slug: string }[];
	selectedBrands: string[];
}

export default function Filters({
	search,
	inStock,
	priceRange,
	minPrice,
	maxPrice,
	categories,
	selectedCategories,
	brands,
	selectedBrands,
}: FiltersProps) {
	const router = useRouter();
	const searchParams = useSearchParams();

	// =============== local state for form values ================
	const [formValues, setFormValues] = useState({
		search: search || "",
		inStock: inStock || false,
		priceMin: priceRange[0] || minPrice,
		priceMax: priceRange[1] || maxPrice,
		categories: selectedCategories || [],
		brands: selectedBrands || [],
	});

	// =============== update url when form values change ================
	useEffect(() => {
		const params = new URLSearchParams(searchParams);

		// update search param
		if (formValues.search) {
			params.set("search", formValues.search);
		} else {
			params.delete("search");
		}

		// update inStock param
		if (formValues.inStock) {
			params.set("inStock", "true");
		} else {
			params.delete("inStock");
		}

		// update price range params
		if (formValues.priceMin !== minPrice) {
			params.set("priceMin", formValues.priceMin.toString());
		} else {
			params.delete("priceMin");
		}

		if (formValues.priceMax !== maxPrice) {
			params.set("priceMax", formValues.priceMax.toString());
		} else {
			params.delete("priceMax");
		}

		// update categories params
		if (formValues.categories.length > 0) {
			params.delete("category");
			formValues.categories.forEach((cat) => {
				params.append("category", cat);
			});
		} else {
			params.delete("category");
		}

		// update brands params
		if (formValues.brands.length > 0) {
			params.delete("brand");
			formValues.brands.forEach((brand) => {
				params.append("brand", brand);
			});
		} else {
			params.delete("brand");
		}

		// update the url
		const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
		router.push(newUrl, { scroll: false });
	}, [formValues, router, searchParams, minPrice, maxPrice]);

	// =============== handle input changes ================
	const handleInputChange = (name: string, value: string | boolean | number) => {
		setFormValues((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	// =============== handle checkbox array changes ================
	const handleArrayChange = (name: string, value: string, checked: boolean) => {
		setFormValues((prev) => ({
			...prev,
			[name]: checked
				? [...(prev[name as keyof typeof prev] as string[]), value]
				: (prev[name as keyof typeof prev] as string[]).filter((item) => item !== value),
		}));
	};

	// =============== handle form submission ================
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
	};

	return (
		<form className="w-full max-w-xs p-4 border rounded bg-white flex flex-col gap-6" onSubmit={handleSubmit}>
			{/* =============== search filter =============== */}
			<div>
				<Label className="mb-1.5" htmlFor="search">
					Search
				</Label>
				<Input
					id="search"
					value={formValues.search}
					onChange={(e) => handleInputChange("search", e.target.value)}
					placeholder="Search products..."
				/>
			</div>
			{/* =============== stock filter =============== */}
			<div className="flex items-center gap-2">
				<Checkbox
					id="inStock"
					checked={formValues.inStock}
					onCheckedChange={(checked) => handleInputChange("inStock", Boolean(checked))}
				/>
				<Label htmlFor="inStock">In Stock Only</Label>
			</div>
			{/* =============== price range filter =============== */}
			<div>
				<Label className="mb-1.5">Price Range</Label>
				<div className="flex items-center gap-2">
					<Input
						id="priceMin"
						type="number"
						min={minPrice}
						max={formValues.priceMax}
						value={formValues.priceMin}
						onChange={(e) => handleInputChange("priceMin", parseInt(e.target.value) || minPrice)}
						className="w-20"
					/>
					<span>-</span>
					<Input
						id="priceMax"
						type="number"
						min={formValues.priceMin}
						max={maxPrice}
						value={formValues.priceMax}
						onChange={(e) => handleInputChange("priceMax", parseInt(e.target.value) || maxPrice)}
						className="w-20"
					/>
				</div>
			</div>
			<Separator />
			{/* =============== category filter =============== */}
			<div>
				<Label className="mb-3">Categories</Label>
				<div className="flex flex-col gap-3 max-h-32 overflow-y-auto">
					{categories.map((cat) => (
						<Label key={cat.slug} className="flex items-center gap-2">
							<Checkbox
								id={cat.slug}
								checked={formValues.categories.includes(cat.slug)}
								onCheckedChange={(checked) =>
									handleArrayChange("categories", cat.slug, Boolean(checked))
								}
							/>
							{cat.name}
						</Label>
					))}
				</div>
			</div>
			<Separator />
			{/* =============== brand filter =============== */}
			<div>
				<Label className="mb-3">Brands</Label>
				<div className="flex flex-col gap-3 max-h-32 overflow-y-auto">
					{brands.map((brand) => (
						<Label key={brand.slug} className="flex items-center gap-2">
							<Checkbox
								id={brand.slug}
								checked={formValues.brands.includes(brand.slug)}
								onCheckedChange={(checked) => handleArrayChange("brands", brand.slug, Boolean(checked))}
							/>
							{brand.name}
						</Label>
					))}
				</div>
			</div>
		</form>
	);
}
