import { Card } from "@/components/ui/card";
import { BrandForm } from "@/components/products/BrandForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NewBrandPage() {
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
				<h1 className="text-3xl font-bold text-gray-900">Create New Brand</h1>
				<p className="text-gray-600 mt-2">Add a new brand to your collection</p>
			</div>

			{/* =============== form section ================ */}
			<Card className="p-6">
				<BrandForm />
			</Card>
		</div>
	);
}
