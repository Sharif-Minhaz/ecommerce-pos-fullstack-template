import { Home, Thermometer, Tv, Sparkles, BookText } from "lucide-react";
import { Card } from "@/components/ui/card";

const categories = [
	{
		title: "HOME & KITCHEN",
		icon: Home,
		bg: "bg-orange-100",
		fadedIcon: Home,
	},
	{
		title: "Heating & Cooling",
		icon: Thermometer,
		bg: "bg-blue-100",
		fadedIcon: Thermometer,
	},
	{
		title: "Electronics",
		icon: Tv,
		bg: "bg-gray-100",
		fadedIcon: Tv,
	},
	{
		title: "Beauty & Fragrance",
		icon: Sparkles,
		bg: "bg-pink-100",
		fadedIcon: Sparkles,
	},
	{
		title: "Kitchen & dining",
		icon: Home,
		bg: "bg-orange-100",
		fadedIcon: Home,
	},
	{
		title: "Stationery & Office Supplies",
		icon: BookText,
		bg: "bg-gray-100",
		fadedIcon: BookText,
	},
	{
		title: "Home Care and Cleaning",
		icon: Home,
		bg: "bg-orange-100",
		fadedIcon: Home,
	},
];

export default function Categories() {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 px-9">
			{categories.map((cat) => (
				<Card
					key={cat.title}
					className={`relative overflow-hidden flex flex-col items-start justify-center p-6 rounded-xl shadow-sm ${cat.bg} min-h-[120px] transition hover:shadow-md`}
				>
					{/* faded background icon */}
					<cat.fadedIcon className="absolute -right-4 -bottom-4 w-20 h-20 text-black/10 pointer-events-none select-none" />
					{/* main icon and title */}
					<div className="flex items-center justify-center flex-col gap-2 z-10 w-full">
						<cat.icon className="w-7 h-7 mb-2 text-black" />
						<span className="font-semibold text-lg text-black leading-tight text-center">
							{cat.title}
						</span>
					</div>
				</Card>
			))}
		</div>
	);
}
