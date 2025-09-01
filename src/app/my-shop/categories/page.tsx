import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getVendorCategories } from "@/app/actions/category";
import Image from "next/image";
import Link from "next/link";
import { Pencil, Plus, FolderOpen, Folder } from "lucide-react";
import { DeleteCategoryButton } from "@/components/shared/DeleteCategoryButton";

export default async function CategoriesPage() {
	// =============== fetch vendor's categories ================
	const { success, categories, error } = await getVendorCategories();

	if (!success) {
		return (
			<div className="container mx-auto px-4 py-8">
				<Card className="p-6 text-center">
					<h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
					<p className="text-gray-600">{error}</p>
				</Card>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8">
			{/* =============== header section ================ */}
			<div className="flex justify-between items-center mb-8">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">My Categories</h1>
					<p className="text-gray-600 mt-2">Organize your products into categories</p>
				</div>
				<Link href="/my-shop/categories/new">
					<Button className="flex items-center gap-2">
						<Plus className="w-4 h-4" />
						Add New Category
					</Button>
				</Link>
			</div>

			{/* =============== categories grid ================ */}
			{categories && categories.length > 0 ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{categories.map((category) => (
						<Card
							key={category._id}
							className="overflow-hidden shadow-sm hover:shadow-md transition-shadow"
						>
							{/* =============== category image ================ */}
							<div className="aspect-video relative bg-gray-50 flex items-center justify-center">
								{category.image ? (
									<Image
										src={category.image}
										alt={category.name}
										width={400}
										height={200}
										className="w-full h-full object-cover"
									/>
								) : (
									<div className="text-gray-400 text-center">
										{category.parent ? (
											<Folder className="w-12 h-12 mx-auto mb-2" />
										) : (
											<FolderOpen className="w-12 h-12 mx-auto mb-2" />
										)}
										<span className="text-lg font-medium">{category.name}</span>
									</div>
								)}
							</div>

							{/* =============== category details ================ */}
							<div className="p-6">
								<div className="mb-4">
									<h3 className="text-xl font-semibold text-gray-900 mb-1">{category.name}</h3>
									<p className="text-sm text-gray-500 mb-2">{category.nameBN}</p>
									<p className="text-gray-600 text-sm line-clamp-2">{category.description}</p>
								</div>

								{/* =============== parent and status info ================ */}
								<div className="mb-4 space-y-2">
									{category.parent && (
										<div className="flex items-center gap-2 text-sm text-gray-500">
											<span>Parent:</span>
											<span className="font-medium">{category.parent.name}</span>
										</div>
									)}
									<div className="flex items-center justify-between">
										<span
											className={`px-2 py-1 rounded-full text-xs font-medium ${
												category.isActive
													? "bg-green-100 text-green-800"
													: "bg-red-100 text-red-800"
											}`}
										>
											{category.isActive ? "Active" : "Inactive"}
										</span>
										<code className="text-xs bg-gray-100 px-2 py-1 rounded">{category.slug}</code>
									</div>
								</div>

								{/* =============== action buttons ================ */}
								<div className="flex gap-2">
									<Link href={`/my-shop/categories/${category._id}/edit`} className="flex-1">
										<Button variant="outline" className="w-full flex items-center gap-2">
											<Pencil className="w-4 h-4" />
											Edit
										</Button>
									</Link>
									<DeleteCategoryButton categoryId={category._id} categoryName={category.name} />
								</div>
							</div>
						</Card>
					))}
				</div>
			) : (
				<Card className="p-12 text-center">
					<div className="text-gray-400 mb-4">
						<FolderOpen className="w-16 h-16 mx-auto mb-4" />
					</div>
					<h3 className="text-xl font-semibold text-gray-900 mb-2">No categories yet</h3>
					<p className="text-gray-600 mb-6">Create categories to organize your products effectively</p>
					<Link href="/my-shop/categories/new">
						<Button>Create Your First Category</Button>
					</Link>
				</Card>
			)}
		</div>
	);
}
