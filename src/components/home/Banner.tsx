import Image from "next/image";
import React from "react";

import BannerImage from "@/assets/banners/free-delivary_Abu Laban_en.webp";

export default function Banner() {
	return (
		<section className="container mx-auto pb-4 pt-6">
			<Image src={BannerImage} alt="Banner" />
		</section>
	);
}
