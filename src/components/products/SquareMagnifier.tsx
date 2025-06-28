"use client";

import React from "react";
import ReactImageMagnify from "react-image-magnify";

export default function SquareMagnifier({ src, alt }: { src: string; alt: string }) {
	return (
		<div className="flex items-center justify-center w-full h-full">
			<ReactImageMagnify
				{...{
					smallImage: {
						alt: alt,
						isFluidWidth: true,
						src: src,
					},
					largeImage: {
						src: src,
						width: 1000,
						height: 1000,
					},
					isHintEnabled: true,
					enlargedImageContainerClassName: "w-full h-full",
					enlargedImageClassName: "object-cover",
				}}
			/>
		</div>
	);
}
