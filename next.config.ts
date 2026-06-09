import type { NextConfig } from "next";

// const isWindows = process.platform === "win32";
// const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
	/* config options here */
	reactCompiler: false,
	output: "standalone",

	// webpack: (config) => {
	// 	// نطبق الحيلة فقط في بيئة التطوير وعلى نظام ويندوز
	// 	if (isDev && isWindows) {
	// 		// خيار لتعطيل الـ HMR الخاص بالـ Webpack Dev Server للعميل والخادم
	// 		if (config.devServer) {
	// 			config.devServer.hot = false;
	// 			config.devServer.liveReload = false;
	// 		}

	// 		// حيلة متقدمة: إزالة مكوّن الـ HotModuleReplacementPlugin من الـ Webpack تماماً
	// 		config.plugins = config.plugins.filter((plugin: unknown) => {
	// 			return (
	// 				plugin?.constructor?.name !== "HotModuleReplacementPlugin"
	// 			);
	// 		});
	// 	}
	// 	return config;
	// },
	allowedDevOrigins: [
		"192.168.92.249",
		"192.168.0.153",
		"192.168.200.6",
		"192.168.200.15",
	],
};

export default nextConfig;
