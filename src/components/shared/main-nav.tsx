"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
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
	const [searchTerm, setSearchTerm] = useState("");
	const [isSearching, setIsSearching] = useState(false);
	const [results, setResults] = useState<
		Array<{ title: string; slug: string; price: number; thumbnail: string | null }>
	>([]);
	const [openDropdown, setOpenDropdown] = useState(false);
	const containerRef = useRef<HTMLDivElement | null>(null);

	const debouncedTerm = useDebounce(searchTerm, 250);

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

	// =============== search suggestions fetch ================
	useEffect(() => {
		let ignore = false;
		async function run() {
			const q = debouncedTerm.trim();
			if (q.length === 0) {
				setResults([]);
				setIsSearching(false);
				return;
			}
			try {
				setIsSearching(true);
				const res = await fetch(`/api/products/search?q=${encodeURIComponent(q)}&limit=8`);
				const data = await res.json();
				if (!ignore) {
					setResults(data?.products || []);
					setOpenDropdown(true);
				}
			} catch {
				if (!ignore) setResults([]);
			} finally {
				if (!ignore) setIsSearching(false);
			}
		}
		run();
		return () => {
			ignore = true;
		};
	}, [debouncedTerm]);

	// close dropdown on outside click
	useEffect(() => {
		function onDocClick(e: MouseEvent) {
			if (!containerRef.current) return;
			if (!containerRef.current.contains(e.target as Node)) {
				setOpenDropdown(false);
			}
		}
		document.addEventListener("mousedown", onDocClick);
		return () => document.removeEventListener("mousedown", onDocClick);
	}, []);

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
					<div className="w-full flex-1 md:w-auto md:flex-none relative" ref={containerRef}>
						<Input
							type="search"
							placeholder={t("search", language)}
							className="h-9 md:w-[300px] lg:w-[400px]"
							value={searchTerm}
							onChange={(e) => {
								setSearchTerm(e.target.value);
								setOpenDropdown(true);
							}}
							onFocus={() => {
								if (results.length > 0) setOpenDropdown(true);
							}}
							onKeyDown={(e) => {
								if (e.key === "Escape") setOpenDropdown(false);
							}}
						/>
						{openDropdown && (searchTerm.trim().length > 0 || isSearching) && (
							<div className="absolute mt-1 w-full max-h-80 overflow-auto rounded-md border bg-background shadow-lg">
								{isSearching && (
									<div className="p-3 text-sm text-muted-foreground">{t("loading", language)}</div>
								)}
								{!isSearching && results.length === 0 && (
									<div className="p-3 text-sm text-muted-foreground">{t("noResults", language)}</div>
								)}
								{!isSearching && results.length > 0 ? (
									<ul className="py-1">
										{results.map((item) => (
											<li key={item.slug} className="">
												<Link
													href={`/products/${item.slug}`}
													className="flex items-center gap-3 px-3 py-2 hover:bg-accent"
													onClick={() => setOpenDropdown(false)}
												>
													{item.thumbnail ? (
														<Image
															src={item.thumbnail}
															alt={item.title}
															className="rounded w-8 h-8 object-cover"
															width={32}
															height={32}
														/>
													) : (
														<div className="h-8 w-8 rounded bg-muted" />
													)}
													<div className="flex-1 min-w-0">
														<p className="truncate text-sm font-medium">{item.title}</p>
														<p className="truncate text-xs text-muted-foreground">
															৳ {item.price}
														</p>
													</div>
												</Link>
											</li>
										))}
									</ul>
								) : (
									<div className="p-3 text-sm text-muted-foreground text-center">
										No results found
									</div>
								)}
							</div>
						)}
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

// =============== simple debounce hook ================
function useDebounce<T>(value: T, delayMs: number): T {
	const [debounced, setDebounced] = useState(value);
	useEffect(() => {
		const id = setTimeout(() => setDebounced(value), delayMs);
		return () => clearTimeout(id);
	}, [value, delayMs]);
	return debounced;
}
