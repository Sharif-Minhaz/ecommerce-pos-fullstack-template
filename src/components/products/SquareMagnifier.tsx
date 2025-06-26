"use client";

import React from "react";
import Image from "next/image";

export default function SquareMagnifier({ src, alt }: { src: string; alt: string }) {
	const [show, setShow] = React.useState(false);
	const [pos, setPos] = React.useState({ x: 0, y: 0 });
	const size = 120;
	const zoom = 2.2;

	return (
		<div
			className="relative w-full h-full"
			onMouseMove={(e) => {
				const rect = (e.target as HTMLDivElement).getBoundingClientRect();
				setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
			}}
			onMouseEnter={() => setShow(true)}
			onMouseLeave={() => setShow(false)}
			style={{ width: "100%", height: "100%" }}
		>
			<Image src={src} alt={alt} fill style={{ objectFit: "contain" }} />
			{show && (
				<div
					className="pointer-events-none absolute border-2 border-blue-400 bg-white/80 shadow-lg"
					style={{
						left: Math.max(0, Math.min(pos.x - size / 2, 320 - size)),
						top: Math.max(0, Math.min(pos.y - size / 2, 320 - size)),
						width: size,
						height: size,
						overflow: "hidden",
						zIndex: 20,
					}}
				>
					<Image
						src={src}
						alt={alt}
						width={320 * zoom}
						height={320 * zoom}
						style={{
							position: "absolute",
							left: -(pos.x * zoom - size / 2),
							top: -(pos.y * zoom - size / 2),
							width: 320 * zoom,
							height: 320 * zoom,
							objectFit: "contain",
						}}
					/>
				</div>
			)}
		</div>
	);
}
