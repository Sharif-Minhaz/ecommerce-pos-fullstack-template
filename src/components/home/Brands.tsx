import { Card } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { getHomeBrands } from "@/app/actions/brand";

export default async function Brands() {
	const { success, brands } = await getHomeBrands();
	const items = success ? brands : [];

	return (
		<div className="container mx-auto my-6">
			<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
				{items?.map((brand: { _id: string; name: string; slug: string; image?: string }) => (
					<Link key={brand._id} href={`/products?brand=${brand.slug}`}>
						<Card className="relative overflow-hidden flex items-center justify-center p-4 rounded-xl shadow-sm bg-white min-h-[90px] transition hover:shadow-md">
							{brand.image ? (
								<Image
									src={brand.image}
									alt={brand.name}
									width={120}
									height={60}
									className="h-10 w-auto object-contain"
								/>
							) : (
								<span className="font-medium">{brand.name}</span>
							)}
						</Card>
					</Link>
				))}
			</div>
		</div>
	);
}
