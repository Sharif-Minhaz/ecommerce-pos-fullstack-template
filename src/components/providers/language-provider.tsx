"use client";

import { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "bn";

interface LanguageContextType {
	language: Language;
	setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
	// Start with "en" as default on both server and client
	const [language, setLanguage] = useState<Language>("en");
	const [isHydrated, setIsHydrated] = useState(false);

	// Load saved language after hydration
	useEffect(() => {
		const savedLanguage = localStorage.getItem("language") as Language;
		if (savedLanguage) {
			setLanguage(savedLanguage);
		}
		setIsHydrated(true);
	}, []);

	// Save language changes to localStorage
	useEffect(() => {
		if (isHydrated) {
			localStorage.setItem("language", language);
		}
	}, [language, isHydrated]);

	// =============== always render children to prevent hydration mismatch ================
	return <LanguageContext.Provider value={{ language, setLanguage }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
	const context = useContext(LanguageContext);
	if (context === undefined) {
		throw new Error("useLanguage must be used within a LanguageProvider");
	}
	return context;
}
