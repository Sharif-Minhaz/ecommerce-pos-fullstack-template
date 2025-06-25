import Categories from "@/components/home/Categories";
import Hero from "@/components/home/Hero";
import TopProducts from "@/components/home/TopProducts";
import TopMenu from "@/components/shared/TopMenu";

export default function HomePage() {
	return (
		<main>
			<TopMenu />
			<Hero />
			<Categories />
			<TopProducts />
		</main>
	);
}
