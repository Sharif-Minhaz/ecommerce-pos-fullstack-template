import React from "react";

export default function Loading() {
	return (
		<div className="relative flex min-h-screen items-center justify-center bg-background">
			{/* =============== decorative background glows =============== */}
			<div className="pointer-events-none absolute inset-0 -z-10">
				<div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
				<div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-orange-400/20 blur-3xl" />
			</div>

			{/* =============== centered loader =============== */}
			<div className="flex flex-col items-center gap-6" role="status" aria-live="polite" aria-busy="true">
				{/* =============== brand mark + spinner =============== */}
				<div className="relative">
					<div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 shadow-lg" />
					<div className="absolute inset-0 -m-2 grid place-items-center">
						<div className="h-20 w-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
					</div>
				</div>

				{/* =============== headline and copy =============== */}
				<div className="text-center">
					<h1 className="text-xl font-semibold tracking-tight text-foreground">Loading</h1>
					<p className="text-sm text-muted-foreground">Preparing your experience…</p>
				</div>

				{/* =============== subtle progress shimmer =============== */}
				<div className="relative h-1 w-56 overflow-hidden rounded-full bg-muted">
					<div className="absolute inset-0 animate-pulse bg-primary/50" />
				</div>

				<span className="sr-only">Content is loading</span>
			</div>
		</div>
	);
}
