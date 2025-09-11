"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Package, Store, MonitorSmartphone } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function FloatingActionButton() {
	const { data: session } = useSession();
	const [isExpanded, setIsExpanded] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	// =============== close menu when clicking outside ================
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setIsExpanded(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	// =============== only show for vendors ================
	if (!session || session.user?.userType !== "vendor") {
		return null;
	}

	return (
		<div className="fixed bottom-1 right-1 md:bottom-6 md:right-6 z-50" ref={menuRef}>
			{/* =============== expanded menu =============== */}
			<div
				className={`mb-18 flex flex-col gap-2 transition-all duration-300 ease-in-out ${
					isExpanded
						? "opacity-100 translate-y-0 pointer-events-auto"
						: "opacity-0 -translate-y-2 pointer-events-none"
				}`}
			>
				<Link href="/pos">
					<div className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
						<div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
							<MonitorSmartphone className="h-5 w-5 text-white" />
						</div>
						<div className="text-sm">
							<div className="font-medium">POS Dashboard</div>
							<div className="text-muted-foreground">Record sales & purchases</div>
						</div>
					</div>
				</Link>
				<Link href="/my-shop/products/new">
					<div className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
						<div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
							<Plus className="h-5 w-5 text-white" />
						</div>
						<div className="text-sm">
							<div className="font-medium">Add Product</div>
							<div className="text-muted-foreground">Create new product</div>
						</div>
					</div>
				</Link>

				<Link href="/my-shop/products">
					<div className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
						<div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
							<Package className="h-5 w-5 text-white" />
						</div>
						<div className="text-sm">
							<div className="font-medium">Manage Products</div>
							<div className="text-muted-foreground">View all products</div>
						</div>
					</div>
				</Link>

				<Link href="/my-shop">
					<div className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
						<div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
							<Store className="h-5 w-5 text-white" />
						</div>
						<div className="text-sm">
							<div className="font-medium">Shop Settings</div>
							<div className="text-muted-foreground">Manage shop info</div>
						</div>
					</div>
				</Link>
			</div>

			{/* =============== main floating button =============== */}
			<Button
				onClick={() => setIsExpanded(!isExpanded)}
				size="lg"
				className="right-0 bottom-0 h-12 w-12 md:h-14 md:w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-primary hover:bg-primary/90 group absolute"
				aria-label="Quick actions"
			>
				<Plus
					className={`h-5 w-5 md:h-6 md:w-6 transition-transform duration-200 ${
						isExpanded ? "rotate-45" : ""
					}`}
				/>

				{/* =============== tooltip =============== */}
				<div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
					Quick Actions
					<div className="absolute left-full top-1/2 -translate-y-1/2 w-0 h-0 border-l-4 border-l-gray-900 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
				</div>
			</Button>
		</div>
	);
}
