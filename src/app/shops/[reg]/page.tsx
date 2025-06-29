import React from "react";
import Product from "@/components/products/Product";
import { IProduct } from "@/types/product";
import { Store, MapPin, Star, Phone, Mail, Calendar } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// =============== dummy shop data ================
const dummyShops = {
	TECH001: {
		_id: "1",
		name: "John Doe",
		email: "john@techmart.com",
		phoneNumber: "+8801712345678",
		is_ban: false,
		userType: "vendor" as const,
		shopName: "TechMart Electronics",
		shopDescription:
			"Your one-stop destination for all electronic gadgets and accessories. We offer the latest smartphones, laptops, and smart home devices with competitive prices and excellent customer service.",
		shopImages: [
			"https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&h=400&fit=crop&crop=center",
			"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&crop=center",
		],
		registrationNumber: "TECH001",
		image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
		createdAt: new Date("2023-01-15"),
		updatedAt: new Date(),
		wishlist: [],
	},
	HOME002: {
		_id: "2",
		name: "Sarah Ahmed",
		email: "sarah@homeappliances.com",
		phoneNumber: "+8801812345678",
		is_ban: false,
		userType: "vendor" as const,
		shopName: "Home Appliances Hub",
		shopDescription:
			"Premium home appliances and kitchen essentials. From refrigerators to coffee makers, we provide quality products that make your home life easier and more comfortable.",
		shopImages: [
			"https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&h=400&fit=crop&crop=center",
			"https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop&crop=center",
		],
		registrationNumber: "HOME002",
		image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
		createdAt: new Date("2023-03-20"),
		updatedAt: new Date(),
		wishlist: [],
	},
};

// =============== dummy products for each shop ================
const dummyProducts: Record<string, IProduct[]> = {
	TECH001: [
		{
			_id: "1",
			title: "Fuji Adapter",
			titleBN: "ফুজি অ্যাডাপ্টার",
			gallery: [
				"/products/fuji-adapter.webp",
				"/products/moulinex-genuine-blender.webp",
				"/products/smartlock-wires.webp",
			],
			discountRate: 25,
			price: 800,
			salePrice: 600,
			highlights: "Universal adapter for various electronic devices",
			highlightsBN: "বিভিন্ন ইলেকট্রনিক ডিভাইসের জন্য সর্বজনীন অ্যাডাপ্টার",
			category: {
				_id: "1",
				name: "Electronics",
				nameBN: "ইলেকট্রনিক্স",
				slug: "electronics",
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			brand: {
				_id: "1",
				name: "Fuji",
				nameBN: "ফুজি",
				slug: "fuji",
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			vendor: dummyShops.TECH001 as any,
			unit: "pcs",
			stock: 30,
			sku: "FUJ-ADAPT-001",
			slug: "fuji-adapter",
			description: "Compatible with multiple devices and provides stable power supply.",
			descriptionBN:
				"একাধিক ডিভাইসের সাথে সামঞ্জস্যপূর্ণ এবং স্থিতিশীল বিদ্যুৎ সরবরাহ প্রদান করে।",
			specification: "Input: 100-240V, Output: 5V/2A, Universal Compatibility",
			specificationBN:
				"ইনপুট: ১০০-২৪০ ভোল্ট, আউটপুট: ৫ ভোল্ট/২ এম্পিয়ার, সর্বজনীন সামঞ্জস্যতা",
			isActive: true,
			isFeatured: true,
			warranty: "6 Months Warranty",
			warrantyBN: "৬ মাস ওয়ারেন্টি",
			tags: ["adapter", "electronics", "universal"],
			createdAt: new Date(),
			updatedAt: new Date(),
		} as IProduct,
		{
			_id: "2",
			title: "Smart Lock Wires",
			titleBN: "স্মার্ট লক তার",
			gallery: ["/products/smartlock-wires.webp", "/products/fuji-adapter.webp"],
			discountRate: 15,
			price: 1200,
			salePrice: 1020,
			highlights: "High-quality smart lock wiring system",
			highlightsBN: "উচ্চ মানের স্মার্ট লক তারের সিস্টেম",
			category: {
				_id: "1",
				name: "Electronics",
				nameBN: "ইলেকট্রনিক্স",
				slug: "electronics",
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			brand: {
				_id: "2",
				name: "SmartLock",
				nameBN: "স্মার্টলক",
				slug: "smartlock",
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			vendor: dummyShops.TECH001 as any,
			unit: "set",
			stock: 15,
			sku: "SMART-WIRE-001",
			slug: "smart-lock-wires",
			description: "Professional smart lock wiring system for security installations.",
			descriptionBN: "নিরাপত্তা ইনস্টলেশনের জন্য পেশাদার স্মার্ট লক তারের সিস্টেম।",
			specification: "Length: 10m, Material: Copper, Voltage: 12V",
			specificationBN: "দৈর্ঘ্য: ১০ মিটার, উপাদান: তামা, ভোল্টেজ: ১২ ভোল্ট",
			isActive: true,
			isFeatured: false,
			warranty: "1 Year Warranty",
			warrantyBN: "১ বছর ওয়ারেন্টি",
			tags: ["smart lock", "wires", "security"],
			createdAt: new Date(),
			updatedAt: new Date(),
		} as IProduct,
	],
	HOME002: [
		{
			_id: "3",
			title: "Al Saif Pressure Cooker 10L",
			titleBN: "আল সাইফ প্রেসার কুকার ১০ লিটার",
			gallery: [
				"/products/al-saif-pressure-cooker-10l.webp",
				"/products/al-saif-pressure-cooker-12l.webp",
			],
			discountRate: 20,
			price: 2500,
			salePrice: 2000,
			highlights: "High-quality pressure cooker for efficient cooking",
			highlightsBN: "দক্ষ রান্নার জন্য উচ্চ মানের প্রেসার কুকার",
			category: {
				_id: "2",
				name: "Kitchen",
				nameBN: "রান্নাঘর",
				slug: "kitchen",
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			brand: {
				_id: "3",
				name: "Al Saif",
				nameBN: "আল সাইফ",
				slug: "al-saif",
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			vendor: dummyShops.HOME002 as any,
			unit: "pcs",
			stock: 25,
			sku: "AL-SAIF-10L",
			slug: "al-saif-pressure-cooker-10l",
			description: "Professional grade pressure cooker for home and commercial use.",
			descriptionBN: "বাড়ি এবং বাণিজ্যিক ব্যবহারের জন্য পেশাদার গ্রেড প্রেসার কুকার।",
			specification: "Capacity: 10L, Material: Stainless Steel, Pressure: 15 PSI",
			specificationBN: "ধারণক্ষমতা: ১০ লিটার, উপাদান: স্টেইনলেস স্টিল, চাপ: ১৫ পিএসআই",
			isActive: true,
			isFeatured: true,
			warranty: "2 Years Warranty",
			warrantyBN: "২ বছর ওয়ারেন্টি",
			tags: ["pressure cooker", "kitchen", "cooking"],
			createdAt: new Date(),
			updatedAt: new Date(),
		} as IProduct,
		{
			_id: "4",
			title: "Moulinex Genuine Blender",
			titleBN: "মুলিনেক্স জেনুইন ব্লেন্ডার",
			gallery: ["/products/moulinex-genuine-blender.webp", "/products/fuji-adapter.webp"],
			discountRate: 30,
			price: 3500,
			salePrice: 2450,
			highlights: "Professional blender for smooth blending experience",
			highlightsBN: "স্মুথ ব্লেন্ডিং অভিজ্ঞতার জন্য পেশাদার ব্লেন্ডার",
			category: {
				_id: "2",
				name: "Kitchen",
				nameBN: "রান্নাঘর",
				slug: "kitchen",
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			brand: {
				_id: "4",
				name: "Moulinex",
				nameBN: "মুলিনেক্স",
				slug: "moulinex",
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			vendor: dummyShops.HOME002 as any,
			unit: "pcs",
			stock: 18,
			sku: "MOULINEX-BLEND",
			slug: "moulinex-genuine-blender",
			description: "High-quality blender perfect for making smoothies and purees.",
			descriptionBN: "স্মুথি এবং পিউরি তৈরির জন্য নিখুঁত উচ্চ মানের ব্লেন্ডার।",
			specification: "Power: 1000W, Speed: 3 levels, Capacity: 1.5L",
			specificationBN: "শক্তি: ১০০০ ওয়াট, গতি: ৩ স্তর, ধারণক্ষমতা: ১.৫ লিটার",
			isActive: true,
			isFeatured: false,
			warranty: "1 Year Warranty",
			warrantyBN: "১ বছর ওয়ারেন্টি",
			tags: ["blender", "kitchen", "smoothie"],
			createdAt: new Date(),
			updatedAt: new Date(),
		} as IProduct,
	],
};

async function getShop(reg: string) {
	return dummyShops[reg as keyof typeof dummyShops];
}

async function getShopProducts(reg: string) {
	return dummyProducts[reg] || [];
}

export default async function ShopPageDetails({ params }: { params: { reg: string } }) {
	const shop = await getShop(params.reg);
	const products = await getShopProducts(params.reg);

	if (!shop) {
		return (
			<div className="container mx-auto px-4 py-8 text-center">
				<h1 className="text-2xl font-bold mb-4">Shop Not Found</h1>
				<p className="text-muted-foreground mb-6">
					The shop you're looking for doesn't exist.
				</p>
				<Link href="/shops" className="text-primary hover:underline">
					Back to Shops
				</Link>
			</div>
		);
	}

	return (
		<div className="min-h-screen">
			{/* =============== shop banner =============== */}
			<div className="relative h-64 md:h-80 overflow-hidden">
				{shop.shopImages && shop.shopImages.length > 0 ? (
					<Image
						src={shop.shopImages[0]}
						alt={shop.shopName || "Shop Banner"}
						fill
						sizes="100vw"
						style={{ objectFit: "cover" }}
					/>
				) : (
					<div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
						<Store className="w-24 h-24 text-white" />
					</div>
				)}
				<div className="absolute inset-0 bg-black bg-opacity-40"></div>
				<div className="absolute bottom-0 left-0 right-0 p-6 text-white">
					<h1 className="text-3xl md:text-4xl font-bold mb-2">{shop.shopName}</h1>
					<p className="text-lg opacity-90">{shop.shopDescription}</p>
				</div>
			</div>

			<div className="container mx-auto px-4 py-8">
				{/* =============== shop information =============== */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
					<div className="lg:col-span-2">
						<div className="bg-white rounded-lg shadow-md p-6">
							<h2 className="text-2xl font-bold mb-4">About This Shop</h2>
							<p className="text-muted-foreground mb-6 leading-relaxed">
								{shop.shopDescription}
							</p>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="flex items-center gap-3">
									<Phone className="w-5 h-5 text-primary" />
									<span>{shop.phoneNumber}</span>
								</div>
								<div className="flex items-center gap-3">
									<Mail className="w-5 h-5 text-primary" />
									<span>{shop.email}</span>
								</div>
								<div className="flex items-center gap-3">
									<MapPin className="w-5 h-5 text-primary" />
									<span>Dhaka, Bangladesh</span>
								</div>
								<div className="flex items-center gap-3">
									<Calendar className="w-5 h-5 text-primary" />
									<span>Member since {shop.createdAt.toLocaleDateString()}</span>
								</div>
							</div>
						</div>
					</div>

					<div className="lg:col-span-1">
						<div className="bg-white rounded-lg shadow-md p-6">
							<h3 className="text-xl font-bold mb-4">Shop Rating</h3>
							<div className="flex items-center gap-2 mb-2">
								<Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
								<span className="text-2xl font-bold">4.5</span>
							</div>
							<p className="text-muted-foreground mb-4">Based on 120 reviews</p>

							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<span className="text-sm">5★</span>
									<div className="flex-1 bg-gray-200 rounded-full h-2">
										<div
											className="bg-yellow-400 h-2 rounded-full"
											style={{ width: "70%" }}
										></div>
									</div>
									<span className="text-sm">70%</span>
								</div>
								<div className="flex items-center gap-2">
									<span className="text-sm">4★</span>
									<div className="flex-1 bg-gray-200 rounded-full h-2">
										<div
											className="bg-yellow-400 h-2 rounded-full"
											style={{ width: "20%" }}
										></div>
									</div>
									<span className="text-sm">20%</span>
								</div>
								<div className="flex items-center gap-2">
									<span className="text-sm">3★</span>
									<div className="flex-1 bg-gray-200 rounded-full h-2">
										<div
											className="bg-yellow-400 h-2 rounded-full"
											style={{ width: "7%" }}
										></div>
									</div>
									<span className="text-sm">7%</span>
								</div>
								<div className="flex items-center gap-2">
									<span className="text-sm">2★</span>
									<div className="flex-1 bg-gray-200 rounded-full h-2">
										<div
											className="bg-yellow-400 h-2 rounded-full"
											style={{ width: "2%" }}
										></div>
									</div>
									<span className="text-sm">2%</span>
								</div>
								<div className="flex items-center gap-2">
									<span className="text-sm">1★</span>
									<div className="flex-1 bg-gray-200 rounded-full h-2">
										<div
											className="bg-yellow-400 h-2 rounded-full"
											style={{ width: "1%" }}
										></div>
									</div>
									<span className="text-sm">1%</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* =============== shop products =============== */}
				<div>
					<h2 className="text-2xl font-bold mb-6">Products from {shop.shopName}</h2>
					{products.length > 0 ? (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
							{products.map((product) => (
								<Product key={product._id} product={product} />
							))}
						</div>
					) : (
						<div className="text-center py-12">
							<Store className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
							<h3 className="text-xl font-semibold mb-2">No Products Available</h3>
							<p className="text-muted-foreground">
								This shop hasn't added any products yet.
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
