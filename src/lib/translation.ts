import en from "@/locales/en.json";
import bn from "@/locales/bn.json";

export const t = (key: string, language: string = "en") => {
	const translations: Record<string, Record<string, string>> = {
		en,
		bn,
	};

	return translations[language][key];
};
