import React from "react";
import ShopCard from "@/components/shops/ShopCard";

// =============== interface for dummy shop data ================
interface DummyShop {
	_id: string;
	name: string;
	email: string;
	phoneNumber: string;
	is_ban: boolean;
	userType: "user" | "vendor" | "admin";
	shopName?: string;
	shopDescription?: string;
	shopImages?: string[];
	registrationNumber?: string;
	image?: string;
	createdAt: Date;
	updatedAt: Date;
	wishlist: unknown[];
}

// =============== dummy data for shops ================
const dummyShops: DummyShop[] = [
	{
		_id: "1",
		name: "John Doe",
		email: "john@techmart.com",
		phoneNumber: "+8801712345678",
		is_ban: false,
		userType: "vendor",
		shopName: "TechMart Electronics",
		shopDescription:
			"Your one-stop destination for all electronic gadgets and accessories. We offer the latest smartphones, laptops, and smart home devices with competitive prices and excellent customer service.",
		shopImages: [
			"https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop&crop=center",
			"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&crop=center",
		],
		registrationNumber: "TECH001",
		image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
		createdAt: new Date(),
		updatedAt: new Date(),
		wishlist: [],
	} as DummyShop,
	{
		_id: "2",
		name: "Sarah Ahmed",
		email: "sarah@homeappliances.com",
		phoneNumber: "+8801812345678",
		is_ban: false,
		userType: "vendor",
		shopName: "Home Appliances Hub",
		shopDescription:
			"Premium home appliances and kitchen essentials. From refrigerators to coffee makers, we provide quality products that make your home life easier and more comfortable.",
		shopImages: [
			"https://images.unsplash.com/photo-1556909114-fcd25c85cd64?w=400&h=400&fit=crop&crop=center",
			"https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop&crop=center",
		],
		registrationNumber: "HOME002",
		image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
		createdAt: new Date(),
		updatedAt: new Date(),
		wishlist: [],
	} as DummyShop,
	{
		_id: "3",
		name: "Ahmed Khan",
		email: "ahmed@fashionstore.com",
		phoneNumber: "+8801912345678",
		is_ban: false,
		userType: "vendor",
		shopName: "Fashion Forward",
		shopDescription:
			"Trendy fashion items for men and women. We offer the latest styles in clothing, accessories, and footwear. Stay fashionable with our curated collection.",
		shopImages: [
			"https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop&crop=center",
			"https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=400&fit=crop&crop=center",
		],
		registrationNumber: "FASH003",
		image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
		createdAt: new Date(),
		updatedAt: new Date(),
		wishlist: [],
	} as DummyShop,
	{
		_id: "4",
		name: "Fatima Rahman",
		email: "fatima@beautystore.com",
		phoneNumber: "+8801612345678",
		is_ban: false,
		userType: "vendor",
		shopName: "Beauty & Care",
		shopDescription:
			"Premium beauty and personal care products. From skincare to makeup, we offer authentic products that help you look and feel your best every day.",
		shopImages: [
			"https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop&crop=center",
			"https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop&crop=center",
		],
		registrationNumber: "BEAU004",
		image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
		createdAt: new Date(),
		updatedAt: new Date(),
		wishlist: [],
	} as DummyShop,
	{
		_id: "5",
		name: "Rahim Ali",
		email: "rahim@sportsgear.com",
		phoneNumber: "+8801512345678",
		is_ban: false,
		userType: "vendor",
		shopName: "Sports Gear Pro",
		shopDescription:
			"Professional sports equipment and athletic wear. Whether you're a beginner or a pro, we have everything you need to perform at your best.",
		shopImages: [
			"https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&crop=center",
			"https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&crop=center",
		],
		registrationNumber: "SPOR005",
		image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
		createdAt: new Date(),
		updatedAt: new Date(),
		wishlist: [],
	} as DummyShop,
	{
		_id: "6",
		name: "Nadia Islam",
		email: "nadia@bookstore.com",
		phoneNumber: "+8801412345678",
		is_ban: false,
		userType: "vendor",
		shopName: "Knowledge Hub",
		shopDescription:
			"Books for all ages and interests. From academic textbooks to fiction novels, we have a vast collection that will expand your knowledge and imagination.",
		shopImages: [
			"https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop&crop=center",
			"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=center",
		],
		registrationNumber: "BOOK006",
		image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
		createdAt: new Date(),
		updatedAt: new Date(),
		wishlist: [],
	} as DummyShop,
];

export default function ShopPage() {
	return (
		<div className="container mx-auto px-4 py-8">
			{/* =============== page header =============== */}
			<div className="text-center mb-8">
				<h1 className="text-3xl font-bold mb-2">Our Trusted Shops</h1>
				<p className="text-muted-foreground">
					Discover amazing products from our verified vendors
				</p>
			</div>

			{/* =============== shops grid =============== */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{dummyShops.map((shop) => (
					<ShopCard key={shop._id} shop={shop} />
				))}
			</div>
		</div>
	);
}
