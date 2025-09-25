import React from "react";

export default function Loading() {
	return (
		<div className="container mx-auto py-6 px-2 max-w-6xl">
			<div className="space-y-4">
				<div className="h-10 w-40 bg-muted rounded" />
				<div className="h-60 w-full bg-muted rounded" />
				<div className="h-60 w-full bg-muted rounded" />
			</div>
		</div>
	);
}
