import { Card } from "@/components/ui/card";
import { CategoryForm } from "@/components/products/CategoryForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCategoryById, getVendorCategories } from "@/app/actions/category";
import { notFound } from "next/navigation";

interface EditCategoryPageProps {
	params: Promise<{ id: string }>;
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
	const { id } = await params;

	// =============== fetch category data and parent options ================
	const [categoryResult, categoriesResult] = await Promise.all([getCategoryById(id), getVendorCategories()]);

	if (!categoryResult.success || !categoryResult.category) {
		notFound();
	}

	// =============== filter out current category and its children from parent options ================
	const parentOptions = categoriesResult.success
		? categoriesResult.categories.filter((cat: any) => cat._id !== id && cat.parent?.toString() !== id)
		: [];

	return (
		<div className="container mx-auto px-4 py-8">
			{/* =============== header section ================ */}
			<div className="mb-8">
				<div className="flex items-center gap-4 mb-4">
					<Link href="/my-shop/categories">
						<Button variant="outline" size="sm" className="flex items-center gap-2">
							<ArrowLeft className="w-4 h-4" />
							Back to Categories
						</Button>
					</Link>
				</div>
				<h1 className="text-3xl font-bold text-gray-900">Edit Category</h1>
				<p className="text-gray-600 mt-2">Update your category information</p>
			</div>

			{/* =============== form section ================ */}
			<Card className="p-6">
				<CategoryForm initialData={categoryResult.category} parentOptions={parentOptions} isEdit={true} />
			</Card>
		</div>
	);
}
