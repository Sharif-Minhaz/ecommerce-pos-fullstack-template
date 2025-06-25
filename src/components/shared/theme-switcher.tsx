"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

export function ThemeSwitcher() {
	const [mounted, setMounted] = useState(false);
	const { theme, setTheme } = useTheme();

	// =============== prevent hydration mismatch by mounting after client render ================
	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return (
			<div className="h-9 w-[120px] rounded-md border bg-transparent px-3 py-2 text-sm">
				<div className="h-4 w-16 bg-muted animate-pulse rounded" />
			</div>
		);
	}

	const getThemeIcon = (themeValue: string) => {
		switch (themeValue) {
			case "dark":
				return <Moon className="h-4 w-4" />;
			case "light":
				return <Sun className="h-4 w-4" />;
			case "system":
				return <Monitor className="h-4 w-4" />;
			default:
				return <Monitor className="h-4 w-4" />;
		}
	};

	return (
		<Select value={theme} onValueChange={setTheme}>
			<SelectTrigger className="w-[120px] h-9">
				<SelectValue>
					<div className="flex items-center gap-2">
						{getThemeIcon(theme || "system")}
						<span className="capitalize">{theme || "system"}</span>
					</div>
				</SelectValue>
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="light">
					<div className="flex items-center gap-2">
						<Sun className="h-4 w-4" />
						<span>Light</span>
					</div>
				</SelectItem>
				<SelectItem value="dark">
					<div className="flex items-center gap-2">
						<Moon className="h-4 w-4" />
						<span>Dark</span>
					</div>
				</SelectItem>
				<SelectItem value="system">
					<div className="flex items-center gap-2">
						<Monitor className="h-4 w-4" />
						<span>System</span>
					</div>
				</SelectItem>
			</SelectContent>
		</Select>
	);
}
