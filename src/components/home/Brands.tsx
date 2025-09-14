import Image from "next/image";
import Link from "next/link";
import { getHomeBrands } from "@/app/actions/brand";

export default async function Brands() {
	const { success, brands } = await getHomeBrands();
	const items = success ? brands : [];

	return (
		<div className="container mx-auto my-16">
			{/* =============== section header ================ */}
			<div className="text-center mb-16">
				<h2 className="text-4xl font-bold text-gray-900 mb-4">Trusted Brands</h2>
				<div className="w-16 h-1 bg-blue-500 mx-auto rounded-full"></div>
			</div>

			<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
				{items?.map((brand: { _id: string; name: string; slug: string; image?: string }) => (
					<Link key={brand._id} href={`/products?brand=${brand.slug}`}>
						<div className="group flex flex-col items-center justify-center p-6 rounded-xl hover:bg-blue-50 hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-blue-200">
							{brand.image ? (
								<div className="w-24 h-24 flex items-center justify-center mb-4 bg-white rounded-xl shadow-md border border-gray-200 group-hover:shadow-xl group-hover:border-blue-300 group-hover:scale-105 transition-all duration-300">
									<Image
										src={brand.image}
										alt={brand.name}
										width={80}
										height={80}
										className="max-w-full max-h-full object-contain"
									/>
								</div>
							) : (
								<div className="w-24 h-24 flex items-center justify-center mb-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl group-hover:from-blue-600 group-hover:to-blue-700 group-hover:scale-105 transition-all duration-300 shadow-md">
									<span className="text-white font-bold text-xl">
										{brand.name.charAt(0).toUpperCase()}
									</span>
								</div>
							)}

							<span className="text-sm font-medium text-gray-700 text-center leading-tight group-hover:text-blue-700 transition-colors duration-300">
								{brand.name}
							</span>
						</div>
					</Link>
				))}
			</div>
		</div>
	);
}
