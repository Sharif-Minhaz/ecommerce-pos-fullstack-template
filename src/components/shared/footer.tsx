import React from "react";

export function Footer() {
	return (
		<footer className="px-4 py-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container mx-auto">
				<p className="text-center text-sm text-muted-foreground">
					&copy; {new Date().getFullYear()} E-commerce POS. All rights reserved.
				</p>
			</div>
		</footer>
	);
}
