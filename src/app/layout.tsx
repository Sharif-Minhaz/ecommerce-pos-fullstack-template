import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { MainNav } from "@/components/shared/main-nav";
import { LanguageProvider } from "@/components/providers/language-provider";
import { Footer } from "@/components/shared/footer";
import { CartContextProvider } from "@/components/providers/cart-provider";
import FloatingActionButton from "@/components/shared/FloatingActionButton";
import ShortcutFloatingButton from "@/components/shared/ShortcutFloatingButton";

const inter = Inter({
	subsets: ["latin"],
	display: "swap",
	variable: "--font-inter",
});

export const metadata: Metadata = {
	title: "E-commerce POS",
	description: "A modern e-commerce point of sale system",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`${inter.variable} font-sans`} suppressHydrationWarning>
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem={true} storageKey="theme">
					<AuthProvider>
						<LanguageProvider>
							<CartContextProvider>
								<div className="min-h-screen flex flex-col">
									<MainNav />
									<main className="flex-1">{children}</main>
									<Footer />
								</div>
								<FloatingActionButton />
								<ShortcutFloatingButton />
								<Toaster />
							</CartContextProvider>
						</LanguageProvider>
					</AuthProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
