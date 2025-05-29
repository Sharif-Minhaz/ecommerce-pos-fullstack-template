"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useLanguage } from "@/components/providers/language-provider";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ShoppingCart, User } from "lucide-react";
import Image from "next/image";
import { t } from "@/lib/translation";

export function MainNav() {
	const pathname = usePathname();
	const { data: session } = useSession();
	const { language, setLanguage } = useLanguage();

	return (
		<header className="px-4 sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container mx-auto flex h-16 items-center">
				<div className="mr-4 flex">
					<Link href="/" className="mr-6 flex items-center space-x-2">
						<span className="font-bold">E-commerce POS</span>
					</Link>
					<nav className="flex items-center space-x-6 text-sm font-medium">
						<Link
							href="/wholesales"
							className={`transition-colors hover:text-foreground/80 ${
								pathname === "/wholesales"
									? "text-foreground"
									: "text-foreground/60"
							}`}
						>
							{t("wholesales", language)}
						</Link>
						<Link
							href="/products"
							className={`transition-colors hover:text-foreground/80 ${
								pathname === "/products" ? "text-foreground" : "text-foreground/60"
							}`}
						>
							{t("products", language)}
						</Link>
					</nav>
				</div>
				<div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
					<div className="w-full flex-1 md:w-auto md:flex-none">
						<Input
							type="search"
							placeholder={t("search", language)}
							className="h-9 md:w-[300px] lg:w-[400px]"
						/>
					</div>
					<div className="flex items-center space-x-4">
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setLanguage(language === "en" ? "bn" : "en")}
						>
							{language === "en" ? "বাং" : "EN"}
						</Button>
						<Link href="/cart">
							<Button variant="ghost" size="icon">
								<ShoppingCart className="h-5 w-5" />
							</Button>
						</Link>
						{session ? (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										size="icon"
										className="relative h-8 w-8 rounded-full"
									>
										{session.user?.image ? (
											<Image
												src={session.user.image}
												alt={session.user.name || ""}
												fill
												className="rounded-full object-cover"
											/>
										) : (
											<User className="h-5 w-5" />
										)}
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem asChild>
										<Link href="/profile">{t("viewProfile", language)}</Link>
									</DropdownMenuItem>
									<DropdownMenuItem asChild>
										<Link href="/wishlist">{t("wishlist", language)}</Link>
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => signOut()}>
										{t("logout", language)}
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						) : (
							<Link href="/auth/login">
								<Button variant="ghost" size="sm">
									{t("login", language)}
								</Button>
							</Link>
						)}
					</div>
				</div>
			</div>
		</header>
	);
}
