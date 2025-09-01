import { Card } from "@/components/ui/card";
import { CategoryForm } from "@/components/products/CategoryForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getVendorCategories } from "@/app/actions/category";

export default async function NewCategoryPage() {
	// =============== fetch vendor's categories for parent selection ================
	const { success, categories } = await getVendorCategories();
	const parentOptions = success ? categories : [];

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
				<h1 className="text-3xl font-bold text-gray-900">Create New Category</h1>
				<p className="text-gray-600 mt-2">Add a new category to organize your products</p>
			</div>

			{/* =============== form section ================ */}
			<Card className="p-6">
				<CategoryForm parentOptions={parentOptions} />
			</Card>
		</div>
	);
}
