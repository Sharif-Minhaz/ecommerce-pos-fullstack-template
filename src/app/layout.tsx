import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { MainNav } from "@/components/shared/main-nav";
import { LanguageProvider } from "@/components/providers/language-provider";

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
			<body className={`${inter.variable} font-sans`}>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<AuthProvider>
						<LanguageProvider>
							<div className="min-h-screen flex flex-col">
								<MainNav />
								<main className="flex-1">{children}</main>
							</div>
							<Toaster />
						</LanguageProvider>
					</AuthProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
