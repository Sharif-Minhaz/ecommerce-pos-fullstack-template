import { Card } from "@/components/ui/card";
import { BrandForm } from "@/components/products/BrandForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBrandById } from "@/app/actions/brand";
import { notFound } from "next/navigation";

interface EditBrandPageProps {
	params: Promise<{ id: string }>;
}

export default async function EditBrandPage({ params }: EditBrandPageProps) {
	const { id } = await params;

	// =============== fetch brand data ================
	const { success, brand } = await getBrandById(id);

	if (!success || !brand) {
		notFound();
	}

	return (
		<div className="container mx-auto px-4 py-8">
			{/* =============== header section ================ */}
			<div className="mb-8">
				<div className="flex items-center gap-4 mb-4">
					<Link href="/my-shop/brands">
						<Button variant="outline" size="sm" className="flex items-center gap-2">
							<ArrowLeft className="w-4 h-4" />
							Back to Brands
						</Button>
					</Link>
				</div>
				<h1 className="text-3xl font-bold text-gray-900">Edit Brand</h1>
				<p className="text-gray-600 mt-2">Update your brand information</p>
			</div>

			{/* =============== form section ================ */}
			<Card className="p-6">
				<BrandForm initialData={brand} isEdit={true} />
			</Card>
		</div>
	);
}
