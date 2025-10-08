import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getVendorBrands } from "@/app/actions/brand";
import Image from "next/image";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { DeleteBrandButton } from "@/components/shared/DeleteBrandButton";
import { IBrand } from "@/types/brand";

export default async function BrandsPage() {
	// =============== fetch vendor's brands ================
	const { success, brands, error } = await getVendorBrands();

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
					<h1 className="text-3xl font-bold text-gray-900">My Brands</h1>
					<p className="text-gray-600 mt-2">Manage your brand collection</p>
				</div>
				<Link href="/my-shop/brands/new">
					<Button className="flex items-center gap-2">
						<Plus className="w-4 h-4" />
						Add New Brand
					</Button>
				</Link>
			</div>

			{/* =============== brands grid ================ */}
			{brands && brands.length > 0 ? (
				<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
					{brands.map((brand: IBrand) => (
						<Card
							key={brand._id?.toString()}
							className="overflow-hidden shadow-sm hover:shadow-md transition-shadow py-0"
						>
							{/* =============== brand image ================ */}
							<div className="relative bg-gray-50 flex items-center justify-center">
								{brand.image ? (
									<Image
										src={brand.image}
										alt={brand.name}
										width={400}
										height={300}
										className="w-full h-[300] object-cover p-4"
									/>
								) : (
									<div className="text-gray-400 text-center">
										<span className="text-lg font-medium">{brand.name}</span>
									</div>
								)}
							</div>

							{/* =============== brand details ================ */}
							<div className="p-6 pt-0">
								<div className="mb-4">
									<h3 className="text-xl font-semibold text-gray-900 mb-1">{brand.name}</h3>
									<p className="text-sm text-gray-500 mb-2">{brand.nameBN}</p>
									<p className="text-gray-600 text-sm line-clamp-2">{brand.description}</p>
								</div>

								{/* =============== status and slug ================ */}
								<div className="flex items-center justify-between mb-4">
									<span
										className={`px-2 py-1 rounded-full text-xs font-medium ${
											brand.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
										}`}
									>
										{brand.isActive ? "Active" : "Inactive"}
									</span>
									<code className="text-xs bg-gray-100 px-2 py-1 rounded">{brand.slug}</code>
								</div>

								{/* =============== action buttons ================ */}
								<div className="flex gap-2 items-center">
									<Link href={`/my-shop/brands/${brand._id}/edit`} className="flex-1">
										<Button variant="outline" className="w-full flex items-center gap-2">
											<Pencil className="w-4 h-4" />
											Edit
										</Button>
									</Link>
									<DeleteBrandButton brandId={brand._id?.toString() || ""} brandName={brand.name} />
								</div>
							</div>
						</Card>
					))}
				</div>
			) : (
				<Card className="p-12 text-center">
					<div className="text-gray-400 mb-4">
						<Plus className="w-16 h-16 mx-auto mb-4" />
					</div>
					<h3 className="text-xl font-semibold text-gray-900 mb-2">No brands yet</h3>
					<p className="text-gray-600 mb-6">Start building your brand collection to showcase your products</p>
					<Link href="/my-shop/brands/new">
						<Button>Create Your First Brand</Button>
					</Link>
				</Card>
			)}
		</div>
	);
}
