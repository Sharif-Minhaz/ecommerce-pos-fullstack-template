import Categories from "@/components/home/Categories";
import Hero from "@/components/home/Hero";
import TopMenu from "@/components/shared/TopMenu";

export default function HomePage() {
	return (
		<main className="">
			<TopMenu />
			<Hero />
			<Categories />
		</main>
	);
}
