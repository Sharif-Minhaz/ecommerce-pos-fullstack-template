import Filters from "@/components/products/Filters";
import Product from "@/components/products/Product";
import { getPublicProducts } from "@/app/actions/product";
import { getCategories } from "@/app/actions/category";
import { getBrands } from "@/app/actions/brand";
import { IProduct } from "@/types/product";

// =============== fetch real products ===============
async function getProducts(): Promise<IProduct[]> {
	const res = await getPublicProducts();
	if (!res.success) {
		return [] as IProduct[];
	}
	return res.products as IProduct[];
}

// =============== helpers to read populated fields safely ===============
function getCategoryName(product: IProduct): string {
	return (product.category as unknown as { name?: string })?.name ?? "";
}

function getCategorySlug(product: IProduct): string {
	return (product.category as unknown as { slug?: string })?.slug ?? "";
}

function getBrandName(product: IProduct): string {
	return (product.brand as unknown as { name?: string })?.name ?? "";
}

function getBrandSlug(product: IProduct): string {
	return (product.brand as unknown as { slug?: string })?.slug ?? "";
}

// =============== main page ===============
export default async function ProductsPage({
	searchParams,
}: {
	searchParams: { [key: string]: string | string[] | undefined };
}) {
	const [products, categoriesRes, brandsRes] = await Promise.all([getProducts(), getCategories(), getBrands()]);

	// =============== load categories and brands from db ===============
	const categories = (
		categoriesRes && categoriesRes.success && categoriesRes.categories ? categoriesRes.categories : []
	)
		.map((c: { name?: string; slug?: string }) => ({ name: c?.name || "", slug: c?.slug || "" }))
		.filter((c) => c.name && c.slug);
	const brands = (brandsRes && brandsRes.success && brandsRes.brands ? brandsRes.brands : [])
		.map((b: { name?: string; slug?: string }) => ({ name: b?.name || "", slug: b?.slug || "" }))
		.filter((b) => b.name && b.slug);
	const minPrice = Math.min(...products.map((p) => p.salePrice ?? p.price));
	const maxPrice = Math.max(...products.map((p) => p.salePrice ?? p.price));

	// =============== get filter values from searchParams ===============
	const search = typeof searchParams.search === "string" ? searchParams.search : "";
	const inStock = searchParams.inStock === "on";
	const priceMin = searchParams.priceMin ? Number(searchParams.priceMin) : minPrice;
	const priceMax = searchParams.priceMax ? Number(searchParams.priceMax) : maxPrice;
	const selectedCategories = Array.isArray(searchParams.category)
		? searchParams.category
		: searchParams.category
		? [searchParams.category]
		: [];
	const selectedBrands = Array.isArray(searchParams.brand)
		? searchParams.brand
		: searchParams.brand
		? [searchParams.brand]
		: [];

	// =============== filter products on the server ===============
	const filteredProducts = products.filter((p) => {
		const title = p.title?.toLowerCase() || "";
		const brand = getBrandName(p).toLowerCase();
		const category = getCategoryName(p).toLowerCase();
		const brandSlug = getBrandSlug(p);
		const categorySlug = getCategorySlug(p);
		const price = p.salePrice ?? p.price;

		if (
			search &&
			!(
				title.includes(search.toLowerCase()) ||
				brand.includes(search.toLowerCase()) ||
				category.includes(search.toLowerCase())
			)
		)
			return false;
		if (inStock && p.stock <= 0) return false;
		if (price < priceMin || price > priceMax) return false;
		if (selectedCategories.length && !selectedCategories.includes(categorySlug)) return false;
		if (selectedBrands.length && !selectedBrands.includes(brandSlug)) return false;
		return true;
	});

	return (
		<div className="flex flex-col md:flex-row gap-4 md:gap-6 p-2 md:p-4">
			{/* =============== sticky filters sidebar =============== */}
			<div className="w-full md:w-72 md:shrink-0 mb-4 md:mb-0">
				<div className="md:sticky md:top-20">
					<Filters
						search={search}
						inStock={inStock}
						priceRange={[priceMin, priceMax]}
						minPrice={minPrice}
						maxPrice={maxPrice}
						categories={categories}
						selectedCategories={selectedCategories}
						brands={brands}
						selectedBrands={selectedBrands}
					/>
				</div>
			</div>
			{/* =============== product grid =============== */}
			<div className="flex-1">
				{filteredProducts.length === 0 ? (
					<div className="text-center text-gray-500 mt-20">No products found.</div>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
						{filteredProducts.map((product: IProduct) => (
							<Product key={product._id || product.id} product={product} />
						))}
					</div>
				)}
			</div>
		</div>
	);
}
