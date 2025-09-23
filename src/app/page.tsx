import Categories from "@/components/home/Categories";
import Banner from "@/components/home/Banner";
import Hero from "@/components/home/Hero";
import Offers from "@/components/home/Offers";
import TopProducts from "@/components/home/TopProducts";
import TopMenu from "@/components/shared/TopMenu";
import Brands from "@/components/home/Brands";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function HomePage() {
	const session = await getServerSession(authOptions);

	if (session?.user?.userType === "rider") {
		redirect("/rider/dashboard");
	}
	if (session?.user?.userType === "vendor") {
		redirect("/my-shop");
	}

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
