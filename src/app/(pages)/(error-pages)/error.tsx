"use client";

import { useEffect } from "react";

/**
 * Next.js Client Error Boundary.
 * Under Next.js App Router spec, error.tsx must be a Client Component.
 * To adhere strictly to SSR error page requirements, it immediately redirects
 * the client to the fully server-rendered /500 SSR route.
 */
export default function ErrorBoundary() {
	useEffect(() => {
		// Immediately redirect to the server-side rendered 500 error page
		window.location.href = "/500";
	}, []);

	return (
		<div className="min-h-screen bg-[#07080a] flex items-center justify-center">
			<div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
		</div>
	);
}
