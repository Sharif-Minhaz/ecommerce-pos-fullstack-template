import Categories from "@/components/home/Categories";
import Banner from "@/components/home/Banner";
import Hero from "@/components/home/Hero";
import Offers from "@/components/home/Offers";
import TopProducts from "@/components/home/TopProducts";
import TopMenu from "@/components/shared/TopMenu";

export default function HomePage() {
	return (
		<main>
			<TopMenu />
			<Hero />
			<Categories />
			<Offers />
			<TopProducts />
			<Banner />
		</main>
	);
}
