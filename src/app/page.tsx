import Categories from "@/components/home/Categories";
import Banner from "@/components/home/Banner";
import Hero from "@/components/home/Hero";
import Offers from "@/components/home/Offers";
import TopProducts from "@/components/home/TopProducts";
import TopMenu from "@/components/shared/TopMenu";
import Brands from "@/components/home/Brands";

export default function HomePage() {
	return (
		<main>
			<TopMenu />
			<Hero />
			<Categories />
			<Brands />
			<Offers />
			<TopProducts />
			<Banner />
		</main>
	);
}
