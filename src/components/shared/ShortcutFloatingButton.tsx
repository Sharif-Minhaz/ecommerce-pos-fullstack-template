import React from "react";
import { Button } from "../ui/button";
import { MonitorSmartphone, Truck } from "lucide-react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function ShortcutFloatingButton() {
	const session = await getServerSession(authOptions);
	const userType = session?.user?.userType;

	if (userType === "user" || !userType) return null;

	const link = userType === "vendor" ? "/pos" : "/rider/dashboard";
	const label = userType === "vendor" ? "POS Dashboard" : "Rider Dashboard";
	const Icon = userType === "vendor" ? MonitorSmartphone : Truck;

	return (
		<Button
			asChild
			size="lg"
			className="right-6 bottom-6 z-50 cursor-pointer h-16 w-16 md:h-14 md:w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-orange-500 hover:bg-orange-600 group fixed"
			aria-label="Quick actions"
		>
			<Link href={link}>
				<Icon className="text-white" />

				{/* =============== tooltip =============== */}
				<div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
					{label}
					<div className="absolute left-full top-1/2 -translate-y-1/2 w-0 h-0 border-l-4 border-l-gray-900 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
				</div>
			</Link>
		</Button>
	);
}
