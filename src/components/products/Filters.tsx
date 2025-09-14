"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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
				<label className="block mb-1 text-sm font-medium">Search</label>
				<input
					type="text"
					value={formValues.search}
					onChange={(e) => handleInputChange("search", e.target.value)}
					className="w-full border px-2 py-1 rounded"
					placeholder="Search products..."
				/>
			</div>
			{/* =============== stock filter =============== */}
			<div>
				<label className="flex items-center gap-2">
					<input
						type="checkbox"
						checked={formValues.inStock}
						onChange={(e) => handleInputChange("inStock", e.target.checked)}
					/>
					In Stock Only
				</label>
			</div>
			{/* =============== price range filter =============== */}
			<div>
				<label className="block mb-1 text-sm font-medium">Price Range</label>
				<div className="flex items-center gap-2">
					<input
						type="number"
						min={minPrice}
						max={formValues.priceMax}
						value={formValues.priceMin}
						onChange={(e) => handleInputChange("priceMin", parseInt(e.target.value) || minPrice)}
						className="w-20 border px-1 py-1 rounded"
					/>
					<span>-</span>
					<input
						type="number"
						min={formValues.priceMin}
						max={maxPrice}
						value={formValues.priceMax}
						onChange={(e) => handleInputChange("priceMax", parseInt(e.target.value) || maxPrice)}
						className="w-20 border px-1 py-1 rounded"
					/>
				</div>
			</div>
			{/* =============== category filter =============== */}
			<div>
				<label className="block mb-1 text-sm font-medium">Categories</label>
				<div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
					{categories.map((cat) => (
						<label key={cat.slug} className="flex items-center gap-2">
							<input
								type="checkbox"
								value={cat.slug}
								checked={formValues.categories.includes(cat.slug)}
								onChange={(e) => handleArrayChange("categories", cat.slug, e.target.checked)}
							/>
							{cat.name}
						</label>
					))}
				</div>
			</div>
			{/* =============== brand filter =============== */}
			<div>
				<label className="block mb-1 text-sm font-medium">Brands</label>
				<div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
					{brands.map((brand) => (
						<label key={brand.slug} className="flex items-center gap-2">
							<input
								type="checkbox"
								value={brand.slug}
								checked={formValues.brands.includes(brand.slug)}
								onChange={(e) => handleArrayChange("brands", brand.slug, e.target.checked)}
							/>
							{brand.name}
						</label>
					))}
				</div>
			</div>
		</form>
	);
}
