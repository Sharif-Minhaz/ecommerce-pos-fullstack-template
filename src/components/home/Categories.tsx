import Image from "next/image";
import Link from "next/link";
import { getHomeCategories } from "@/app/actions/category";

export default async function Categories() {
	// =============== fetch max 8 categories from db ================
	const { success, categories } = await getHomeCategories(8);
	const items = success && Array.isArray(categories) ? categories : [];

	return (
		<div className="container mx-auto my-8">
			{/* =============== section header ================ */}
			<div className="text-center mb-16">
				<h2 className="text-4xl font-bold text-gray-900 mb-4">Popular Categories</h2>
				<div className="w-16 h-1 bg-blue-500 mx-auto rounded-full"></div>
			</div>

			<div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6 gap-4">
				{items.map((cat: { _id: string; name: string; slug: string; image?: string }) => (
					<Link key={cat._id} href={`/products?category=${cat.slug}`}>
						<div className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md hover:border-gray-300 transition-all duration-200">
							{/* =============== category image ================ */}
							<div className="aspect-square relative overflow-hidden">
								{cat.image ? (
									<Image
										src={cat.image}
										alt={cat.name}
										fill
										className="object-cover group-hover:scale-105 transition-transform duration-200"
									/>
								) : (
									<div className="w-full h-full bg-gray-100 flex items-center justify-center">
										<span className="text-2xl font-bold text-gray-400">
											{cat.name.charAt(0).toUpperCase()}
										</span>
									</div>
								)}
							</div>

							{/* =============== category name ================ */}
							<div className="p-2">
								<h3 className="text-xs font-medium text-gray-700 text-center group-hover:text-gray-900 transition-colors duration-200 leading-tight">
									{cat.name}
								</h3>
							</div>
						</div>
					</Link>
				))}
			</div>
		</div>
	);
}
