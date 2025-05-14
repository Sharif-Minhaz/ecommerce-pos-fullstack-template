import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	distDir: ".next",
	images: {
		remotePatterns: [
			{
				hostname: "**",
			},
		],
	},
};
export default nextConfig;
