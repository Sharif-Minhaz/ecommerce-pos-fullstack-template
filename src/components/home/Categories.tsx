import { Card } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { getHomeCategories } from "@/app/actions/category";

export default async function Categories() {
	// =============== fetch max 8 categories from db ================
	const { success, categories } = await getHomeCategories(8);
	const items = success && Array.isArray(categories) ? categories : [];

	return (
		<div className="container mx-auto">
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
				{items.map((cat: { _id: string; name: string; slug: string; image?: string }) => (
					<Link key={cat._id} href={`/products?category=${cat.slug}`}>
						<Card className="relative overflow-hidden flex flex-col items-start justify-center p-6 rounded-xl shadow-sm bg-gray-50 min-h-[120px] transition hover:shadow-md">
							{/* =============== category image background ================ */}
							{cat.image ? (
								<Image
									src={cat.image}
									alt={cat.name}
									width={300}
									height={120}
									className="absolute inset-0 h-full w-full object-cover opacity-10"
								/>
							) : null}
							{/* =============== title ================ */}
							<div className="flex items-center justify-center flex-col gap-2 z-10 w-full">
								<span className="font-semibold text-lg text-black leading-tight text-center">
									{cat.name}
								</span>
							</div>
						</Card>
					</Link>
				))}
			</div>
		</div>
	);
}
