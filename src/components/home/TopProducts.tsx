import React from "react";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselPrevious,
	CarouselNext,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Product from "../products/Product";

const topProducts = [
	{
		id: 1,
		title: "Al Saif Pressure Cooker 10L",
		titleBN: "আল সাইফ প্রেসার কুকার ১০ লিটার",
		gallery: ["/products/al-saif-pressure-cooker-10l.webp"],
		discountRate: 15,
		price: 2500,
		salePrice: 2125,
		highlights: "High-quality stainless steel pressure cooker with safety features",
		highlightsBN: "উচ্চ মানের স্টেইনলেস স্টিল প্রেসার কুকার নিরাপত্তা বৈশিষ্ট্যসহ",
		category: "Kitchen Appliances",
		brand: "Al Saif",
		unit: "pcs",
		stock: 25,
		sku: "AS-PC-10L-001",
		slug: "al-saif-pressure-cooker-10l",
		description:
			"Premium quality pressure cooker perfect for cooking rice, meat, and vegetables quickly and efficiently.",
		descriptionBN:
			"উচ্চ মানের প্রেসার কুকার যা চাল, মাংস এবং সবজি দ্রুত ও দক্ষতার সাথে রান্নার জন্য পারফেক্ট।",
		specification: "Capacity: 10L, Material: Stainless Steel, Safety Valve Included",
		specificationBN:
			"ধারণক্ষমতা: ১০ লিটার, উপাদান: স্টেইনলেস স্টিল, নিরাপত্তা ভালভ অন্তর্ভুক্ত",
		isActive: true,
		isFeatured: true,
		warranty: "2 Years Manufacturer Warranty",
		warrantyBN: "২ বছর প্রস্তুতকারকের ওয়ারেন্টি",
		createdAt: new Date(),
	},
	{
		id: 2,
		title: "Al Saif Pressure Cooker (Classic)",
		titleBN: "আল সাইফ প্রেসার কুকার (ক্লাসিক)",
		gallery: ["/products/al-saif-pressure-cooker.webp"],
		discountRate: 15,
		price: 2500,
		salePrice: 2125,
		highlights: "High-quality stainless steel pressure cooker with safety features",
		highlightsBN: "উচ্চ মানের স্টেইনলেস স্টিল প্রেসার কুকার নিরাপত্তা বৈশিষ্ট্যসহ",
		category: "Kitchen Appliances",
		brand: "Al Saif",
		unit: "pcs",
		stock: 25,
		sku: "AS-PC-CLASSIC-002",
		slug: "al-saif-pressure-cooker-classic",
		description:
			"Premium quality pressure cooker perfect for cooking rice, meat, and vegetables quickly and efficiently.",
		descriptionBN:
			"উচ্চ মানের প্রেসার কুকার যা চাল, মাংস এবং সবজি দ্রুত ও দক্ষতার সাথে রান্নার জন্য পারফেক্ট।",
		specification: "Capacity: 10L, Material: Stainless Steel, Safety Valve Included",
		specificationBN:
			"ধারণক্ষমতা: ১০ লিটার, উপাদান: স্টেইনলেস স্টিল, নিরাপত্তা ভালভ অন্তর্ভুক্ত",
		isActive: true,
		isFeatured: true,
		warranty: "2 Years Manufacturer Warranty",
		warrantyBN: "২ বছর প্রস্তুতকারকের ওয়ারেন্টি",
		createdAt: new Date(),
	},
	{
		id: 3,
		title: "Panasonic Steam Iron Blue",
		titleBN: "প্যানাসনিক স্টিম ইস্ত্রি নীল",
		gallery: ["/products/panasonic-steam-iron-blue.webp"],
		discountRate: 20,
		price: 1800,
		salePrice: 1440,
		highlights: "Advanced steam iron with temperature control and steam burst",
		highlightsBN: "তাপমাত্রা নিয়ন্ত্রণ এবং স্টিম বার্স্ট সহ উন্নত স্টিম ইস্ত্রি",
		category: "Home Appliances",
		brand: "Panasonic",
		unit: "pcs",
		stock: 15,
		sku: "PAN-SI-BLUE-001",
		slug: "panasonic-steam-iron-blue",
		description:
			"Professional steam iron with ceramic soleplate for smooth ironing experience.",
		descriptionBN: "সরু ইস্ত্রি অভিজ্ঞতার জন্য সিরামিক সোলপ্লেট সহ পেশাদার স্টিম ইস্ত্রি।",
		specification: "Power: 1800W, Tank Capacity: 300ml, Ceramic Soleplate",
		specificationBN: "পাওয়ার: ১৮০০ ওয়াট, ট্যাঙ্ক ধারণক্ষমতা: ৩০০ মিলি, সিরামিক সোলপ্লেট",
		isActive: true,
		isFeatured: true,
		warranty: "1 Year Warranty",
		warrantyBN: "১ বছর ওয়ারেন্টি",
		createdAt: new Date(),
	},
	{
		id: 4,
		title: "Moulinex Genuine Blender",
		titleBN: "মুলিনেক্স জেনুইন ব্লেন্ডার",
		gallery: ["/products/moulinex-genuine-blender.webp"],
		discountRate: 12,
		price: 3200,
		salePrice: 2816,
		highlights: "Professional blender with multiple speed settings and durable blades",
		highlightsBN: "একাধিক গতি সেটিং এবং টেকসই ব্লেড সহ পেশাদার ব্লেন্ডার",
		category: "Kitchen Appliances",
		brand: "Moulinex",
		unit: "pcs",
		stock: 8,
		sku: "MOU-BLEND-001",
		slug: "moulinex-genuine-blender",
		description: "High-performance blender perfect for smoothies, soups, and food processing.",
		descriptionBN:
			"স্মুথি, স্যুপ এবং খাদ্য প্রক্রিয়াকরণের জন্য পারফেক্ট উচ্চ-কর্মক্ষমতা ব্লেন্ডার।",
		specification: "Power: 1000W, Capacity: 1.5L, 6 Speed Settings",
		specificationBN: "পাওয়ার: ১০০০ ওয়াট, ধারণক্ষমতা: ১.৫ লিটার, ৬ গতি সেটিং",
		isActive: true,
		isFeatured: true,
		warranty: "2 Years Warranty",
		warrantyBN: "২ বছর ওয়ারেন্টি",
		createdAt: new Date(),
	},
	{
		id: 5,
		title: "Rebune Hair Styler Brush 1300W",
		titleBN: "রেবুন হেয়ার স্টাইলার ব্রাশ ১৩০০ ওয়াট",
		gallery: ["/products/rebune-hair-styler-brush-1300w.webp"],
		discountRate: 18,
		price: 1500,
		salePrice: 1230,
		highlights: "Professional hair styling brush with ceramic coating and heat protection",
		highlightsBN: "সিরামিক কোটিং এবং তাপ সুরক্ষা সহ পেশাদার চুল স্টাইলিং ব্রাশ",
		category: "Personal Care",
		brand: "Rebune",
		unit: "pcs",
		stock: 20,
		sku: "REB-HSB-1300W-001",
		slug: "rebune-hair-styler-brush-1300w",
		description: "Advanced hair styling brush for salon-quality results at home.",
		descriptionBN: "বাড়িতে সেলুন-মানের ফলাফলের জন্য উন্নত চুল স্টাইলিং ব্রাশ।",
		specification: "Power: 1300W, Ceramic Coating, Heat Protection Technology",
		specificationBN: "পাওয়ার: ১৩০০ ওয়াট, সিরামিক কোটিং, তাপ সুরক্ষা প্রযুক্তি",
		isActive: true,
		isFeatured: true,
		warranty: "1 Year Warranty",
		warrantyBN: "১ বছর ওয়ারেন্টি",
		createdAt: new Date(),
	},
	{
		id: 6,
		title: "Rebune Hair Styler Brush",
		titleBN: "রেবুন হেয়ার স্টাইলার ব্রাশ",
		gallery: ["/products/rebune-hair-styler-brush.webp"],
		discountRate: 18,
		price: 1500,
		salePrice: 1230,
		highlights: "Professional hair styling brush with ceramic coating and heat protection",
		highlightsBN: "সিরামিক কোটিং এবং তাপ সুরক্ষা সহ পেশাদার চুল স্টাইলিং ব্রাশ",
		category: "Personal Care",
		brand: "Rebune",
		unit: "pcs",
		stock: 20,
		sku: "REB-HSB-002",
		slug: "rebune-hair-styler-brush-variant",
		description: "Advanced hair styling brush for salon-quality results at home.",
		descriptionBN: "বাড়িতে সেলুন-মানের ফলাফলের জন্য উন্নত চুল স্টাইলিং ব্রাশ।",
		specification: "Power: 1300W, Ceramic Coating, Heat Protection Technology",
		specificationBN: "পাওয়ার: ১৩০০ ওয়াট, সিরামিক কোটিং, তাপ সুরক্ষা প্রযুক্তি",
		isActive: true,
		isFeatured: true,
		warranty: "1 Year Warranty",
		warrantyBN: "১ বছর ওয়ারেন্টি",
		createdAt: new Date(),
	},
	{
		id: 7,
		title: "Al Saif Pressure Cooker 18L",
		titleBN: "আল সাইফ প্রেসার কুকার ১৮ লিটার",
		gallery: ["/products/al-saif-pressure-cooker-18l.webp"],
		discountRate: 10,
		price: 3800,
		salePrice: 3420,
		highlights: "Large capacity pressure cooker for family cooking needs",
		highlightsBN: "পরিবারের রান্নার চাহিদার জন্য বড় ধারণক্ষমতার প্রেসার কুকার",
		category: "Kitchen Appliances",
		brand: "Al Saif",
		unit: "pcs",
		stock: 12,
		sku: "AS-PC-18L-001",
		slug: "al-saif-pressure-cooker-18l",
		description: "Perfect for large families and bulk cooking with superior safety features.",
		descriptionBN: "বড় পরিবার এবং বাল্ক রান্নার জন্য পারফেক্ট, উচ্চতর নিরাপত্তা বৈশিষ্ট্যসহ।",
		specification: "Capacity: 18L, Material: Stainless Steel, Safety Lock System",
		specificationBN: "ধারণক্ষমতা: ১৮ লিটার, উপাদান: স্টেইনলেস স্টিল, নিরাপত্তা লক সিস্টেম",
		isActive: true,
		isFeatured: true,
		warranty: "2 Years Manufacturer Warranty",
		warrantyBN: "২ বছর প্রস্তুতকারকের ওয়ারেন্টি",
		createdAt: new Date(),
	},
	{
		id: 8,
		title: "Fuji Adapter",
		titleBN: "ফুজি অ্যাডাপ্টার",
		gallery: ["/products/fuji-adapter.webp"],
		discountRate: 25,
		price: 800,
		salePrice: 600,
		highlights: "Universal adapter for various electronic devices",
		highlightsBN: "বিভিন্ন ইলেকট্রনিক ডিভাইসের জন্য সর্বজনীন অ্যাডাপ্টার",
		category: "Electronics",
		brand: "Fuji",
		unit: "pcs",
		stock: 30,
		sku: "FUJ-ADAPT-001",
		slug: "fuji-adapter",
		description: "Compatible with multiple devices and provides stable power supply.",
		descriptionBN:
			"একাধিক ডিভাইসের সাথে সামঞ্জস্যপূর্ণ এবং স্থিতিশীল বিদ্যুৎ সরবরাহ প্রদান করে।",
		specification: "Input: 100-240V, Output: 5V/2A, Universal Compatibility",
		specificationBN: "ইনপুট: ১০০-২৪০ ভোল্ট, আউটপুট: ৫ ভোল্ট/২ এম্পিয়ার, সর্বজনীন সামঞ্জস্যতা",
		isActive: true,
		isFeatured: true,
		warranty: "6 Months Warranty",
		warrantyBN: "৬ মাস ওয়ারেন্টি",
		createdAt: new Date(),
	},
];

export default function TopProducts() {
	return (
		<section className="bg-blue-50 rounded-xl container mx-auto pb-4 mt-8">
			<h2 className="text-xl dark:text-black font-semibold pt-6 p-4 mb-2 flex items-center gap-2 justify-between">
				Trending products{" "}
				<Link href="/products">
					<Button variant="default" size="sm" className="text-white">
						View All <ArrowRight className="w-4 h-4" />
					</Button>
				</Link>
			</h2>
			<div className="relative">
				<Carousel className="w-full">
					<CarouselContent className="px-4">
						{topProducts.map((product) => (
							<CarouselItem key={product.id} className="basis-1/6">
								<Product product={product} />
							</CarouselItem>
						))}
					</CarouselContent>
					<CarouselPrevious className="-left-6" />
					<CarouselNext className="-right-6" />
				</Carousel>
			</div>
		</section>
	);
}
