"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { getWishlistProducts } from "@/app/actions/wishlist";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import ProductCard from "@/components/products/Product";
import type { IProduct } from "@/types/product";

type WishlistProduct = IProduct;

export default function WishlistPage() {
	const { status } = useSession();
	const [loading, setLoading] = useState(true);
	const [items, setItems] = useState<WishlistProduct[]>([]);

	useEffect(() => {
		let mounted = true;
		(async () => {
			if (status === "loading") return;
			if (status === "unauthenticated") {
				setLoading(false);
				return;
			}
			try {
				setLoading(true);
				const res = await getWishlistProducts();
				if (mounted && res.success) setItems((res.products || []) as WishlistProduct[]);
			} finally {
				if (mounted) setLoading(false);
			}
		})();
		return () => {
			mounted = false;
		};
	}, [status]);

	if (status === "loading" || loading) {
		return (
			<div className="min-h-[40vh] flex items-center justify-center text-muted-foreground">
				<Loader2 className="w-6 h-6 animate-spin" />
			</div>
		);
	}

	if (status === "unauthenticated") {
		return (
			<div className="container mx-auto px-4 py-10 text-center">
				<p className="mb-4">Please log in to view your wishlist.</p>
				<Link href="/auth/login">
					<Button>Login</Button>
				</Link>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8 max-w-5xl">
			<h1 className="text-2xl font-bold mb-6">My Wishlist</h1>
			{items.length === 0 ? (
				<div className="text-muted-foreground">Your wishlist is empty.</div>
			) : (
				<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
					{items.map((product) => (
						<ProductCard key={product._id as string} product={product as IProduct} />
					))}
				</div>
			)}
		</div>
	);
}
