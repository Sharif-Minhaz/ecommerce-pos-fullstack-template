"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { getRiderProfile } from "@/app/actions/rider";
import { useLanguage } from "@/components/providers/language-provider";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { User } from "lucide-react";
import Image from "next/image";
import { t } from "@/lib/translation";
import { ThemeSwitcher } from "./theme-switcher";
import { CartSheet } from "./CartSheet";
import { NotificationDropdown } from "./NotificationDropdown";

export function MainNav() {
	const pathname = usePathname();
	const { data: session } = useSession();
	const { language, setLanguage } = useLanguage();
	const [hasRiderProfile, setHasRiderProfile] = useState<boolean | null>(null);

	useEffect(() => {
		let isMounted = true;
		async function checkRider() {
			try {
				if (session?.user?.userType !== "rider") {
					if (isMounted) setHasRiderProfile(false);
					return;
				}
				const res = await getRiderProfile();
				if (isMounted) setHasRiderProfile(!!res.success);
			} catch {
				if (isMounted) setHasRiderProfile(false);
			}
		}
		checkRider();
		return () => {
			isMounted = false;
		};
	}, [session?.user?.userType]);

	return (
		<header className="px-4 sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container mx-auto flex h-16 items-center">
				<div className="mr-4 flex">
					<Link href="/" className="mr-6 flex items-center space-x-2">
						<span className="font-bold">E-commerce POS</span>
					</Link>
					<nav className="flex items-center space-x-6 text-sm font-medium">
						<Link
							href="/shops"
							className={`transition-colors hover:text-foreground/80 ${
								pathname === "/shops" ? "text-foreground" : "text-foreground/60"
							}`}
						>
							{t("shops", language)}
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
						<Button variant="ghost" size="sm" onClick={() => setLanguage(language === "en" ? "bn" : "en")}>
							{language === "en" ? "বাং" : "EN"}
						</Button>
						{/* ========================= theme switcher ========================= */}
						<ThemeSwitcher />
						{/* ========================= cart sheet ========================= */}
						<CartSheet />
						{/* ========================= user dropdown ========================= */}
						{session ? (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full">
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
										<Link href="/my-orders">My Orders</Link>
									</DropdownMenuItem>
									{session.user?.userType === "vendor" && (
										<>
											<DropdownMenuItem asChild>
												<Link href="/my-shop">My Shop</Link>
											</DropdownMenuItem>
											<DropdownMenuItem asChild>
												<Link href="/my-shop/coupons">Coupons</Link>
											</DropdownMenuItem>
											<DropdownMenuItem asChild>
												<Link href="/my-shop/manage-orders">Manage Orders</Link>
											</DropdownMenuItem>
										</>
									)}
									{session.user?.userType === "rider" && hasRiderProfile === false && (
										<DropdownMenuItem asChild>
											<Link href="/auth/register-rider">Become a Rider</Link>
										</DropdownMenuItem>
									)}
									{session.user?.userType === "user" && (
										<DropdownMenuItem asChild>
											<Link href="/auth/register-rider">Become a Rider</Link>
										</DropdownMenuItem>
									)}
									<DropdownMenuItem asChild>
										<Link href="/wishlist">{t("wishlist", language)}</Link>
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => signOut({ callbackUrl: "/auth/login" })}>
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
						{/* ============= notification dropdown ============ */}
						<NotificationDropdown />
					</div>
				</div>
			</div>
		</header>
	);
}
