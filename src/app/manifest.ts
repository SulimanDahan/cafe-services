import { MetadataRoute } from "next";

/**
 * Generates the official Web App Manifest dynamically for Progressive Web App (PWA) support.
 * Next.js automatically compiles this file and serves it as `/manifest.webmanifest`.
 *
 * @returns {MetadataRoute.Manifest} The manifest object configuration.
 */
export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "مقهى الخدمات الفاخرة - اطلب الآن",
		short_name: "اطلب الآن",
		description:
			"الطلب الذاتي المباشر من طاولة المقهى مع تحديثات الحجز والطلبات الفورية المباشرة.",
		start_url: "/",
		scope: "/order",
		display: "standalone",
		background_color: "#07080a",
		theme_color: "#07080a",
		icons: [
			{
				src: "/icon.svg",
				sizes: "any",
				type: "image/svg+xml",
				purpose: "any",
			},
			{
				src: "/icon.svg",
				sizes: "192x192",
				type: "image/svg+xml",
				purpose: "maskable",
			},
			{
				src: "/icon.svg",
				sizes: "512x512",
				type: "image/svg+xml",
				purpose: "any",
			},
		],
	};
}
