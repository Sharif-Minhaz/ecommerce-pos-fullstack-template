import Filters from "@/components/products/Filters";
import Product from "@/components/products/Product";
import { getPublicProducts } from "@/app/actions/product";
import { getCategories } from "@/app/actions/category";
import { getBrands } from "@/app/actions/brand";
import { IProduct } from "@/types/product";
import { ICategory } from "@/types/category";
import { IBrand } from "@/types/brand";

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
	const { search, inStock, priceMin, priceMax, category, brand } = await searchParams;
	const [products, categoriesRes, brandsRes] = await Promise.all([getProducts(), getCategories(), getBrands()]);

	// =============== load categories and brands from db ===============
	const categories = (
		categoriesRes && categoriesRes.success && categoriesRes.categories ? categoriesRes.categories : []
	)
		.map((category: { name?: string; slug?: string }) => ({
			name: category?.name || "",
			slug: category?.slug || "",
		}))
		.filter((category: ICategory) => category.name && category.slug);

	const brands = (brandsRes && brandsRes.success && brandsRes.brands ? brandsRes.brands : [])
		.map((brand: { name?: string; slug?: string }) => ({ name: brand?.name || "", slug: brand?.slug || "" }))
		.filter((brand: IBrand) => brand.name && brand.slug);

	const minPrice = Math.min(...products.map((price) => price.salePrice ?? price.price));
	const maxPrice = Math.max(...products.map((price) => price.salePrice ?? price.price));

	// =============== get filter values from searchParams ===============
	const searchKey = typeof search === "string" ? search : "";
	const inStockKey = inStock === "on";
	const priceMinKey = priceMin ? Number(priceMin) : minPrice;
	const priceMaxKey = priceMax ? Number(priceMax) : maxPrice;
	const selectedCategories = Array.isArray(category) ? category : category ? [category] : [];
	const selectedBrands = Array.isArray(brand) ? brand : brand ? [brand] : [];

	// =============== filter products on the server ===============
	const filteredProducts = products.filter((product) => {
		const title = product.title?.toLowerCase() || "";
		const brand = getBrandName(product).toLowerCase();
		const category = getCategoryName(product).toLowerCase();
		const brandSlug = getBrandSlug(product);
		const categorySlug = getCategorySlug(product);
		const price = product.salePrice ?? product.price;

		if (
			searchKey &&
			!(
				title.includes(searchKey.toLowerCase()) ||
				brand.includes(searchKey.toLowerCase()) ||
				category.includes(searchKey.toLowerCase())
			)
		)
			return false;

		if (inStockKey && product.stock <= 0) return false;
		if (price < priceMinKey || price > priceMaxKey) return false;
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
						search={searchKey}
						inStock={inStockKey}
						priceRange={[priceMinKey, priceMaxKey]}
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
