import { NextResponse } from "next/server";
import { connectToDatabase } from "@/db";
import { Product } from "@/models/ProductModel";

export async function GET(request: Request) {
	try {
		await connectToDatabase();

		const { searchParams } = new URL(request.url);
		const q = (searchParams.get("q") || "").trim();
		const limitParam = parseInt(searchParams.get("limit") || "10", 10);
		const limit = Math.min(Math.max(limitParam, 1), 20);

		if (!q) {
			return NextResponse.json({ success: true, products: [] });
		}

		// =============== basic search by text/regex for suggestions ================
		const query: any = { isActive: true };

		// prefer text search for longer queries, fallback to case-insensitive regex
		if (q.length >= 3) {
			query.$text = { $search: q };
		} else {
			query.$or = [{ title: { $regex: q, $options: "i" } }, { titleBN: { $regex: q, $options: "i" } }];
		}

		const products = await Product.find(query)
			.select("title slug price salePrice gallery")
			.sort(q.length >= 3 ? { score: { $meta: "textScore" } } : { createdAt: -1 })
			.limit(limit)
			.lean();

		const mapped = products.map((p: any) => ({
			title: p.title,
			slug: p.slug,
			price: p.salePrice ?? p.price,
			thumbnail:
				Array.isArray(p.gallery) && p.gallery.length > 0
					? p.gallery[0] && typeof p.gallery[0] === "object"
						? p.gallery[0].url
						: p.gallery[0]
					: null,
		}));

		return NextResponse.json({ success: true, products: mapped });
	} catch (error) {
		return NextResponse.json(
			{ success: false, error: (error as Error).message || "Something went wrong" },
			{ status: 500 }
		);
	}
}
