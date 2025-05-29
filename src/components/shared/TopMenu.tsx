import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const categories = [
	{ name: "Electronics", href: "/electronics" },
	{ name: "Clothing", href: "/clothing" },
	{ name: "Books", href: "/books" },
	{ name: "Home & Garden", href: "/home-garden" },
];

export const TopMenu = () => {
	return (
		<nav className="border-b bg-white sticky top-0 z-50">
			<div className="container mx-auto">
				<div className="flex items-center justify-between h-16 -ml-3">
					<div className="flex items-center gap-4">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" className="flex items-center gap-2">
									<Menu className="h-5 w-5" />
									<span>Categories</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="start" className="w-48">
								{categories.map((category) => (
									<DropdownMenuItem key={category.href} asChild>
										<Link
											href={category.href}
											className="w-full cursor-pointer"
										>
											{category.name}
										</Link>
									</DropdownMenuItem>
								))}
							</DropdownMenuContent>
						</DropdownMenu>
					</div>

					<div className="hidden md:flex items-center space-x-4">
						<Button variant="ghost" asChild>
							<Link href="/deals">Deals</Link>
						</Button>
						<Button variant="ghost" asChild>
							<Link href="/new-arrivals">New Arrivals</Link>
						</Button>
					</div>
				</div>
			</div>
		</nav>
	);
};

export default TopMenu;
