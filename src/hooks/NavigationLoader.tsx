"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import PageLoader from "../components/partials/PageLoader";

/**
 * Global navigation interceptor to display the premium loader during client-side transitions.
 */
export default function NavigationLoader() {
	const pathname = usePathname();
	const [isLoading, setIsLoading] = useState(false);
	const [prevPathname, setPrevPathname] = useState(pathname);

	if (pathname !== prevPathname) {
		setPrevPathname(pathname);
		setIsLoading(false);
	}

	useEffect(() => {
		const handleAnchorClick = (event: MouseEvent) => {
			const target = event.target as HTMLElement;
			const anchor = target.closest("a");

			if (anchor) {
				const href = anchor.getAttribute("href");
				const targetAttr = anchor.getAttribute("target");

				// Intercept only internal relative routes starting with a single forward slash
				if (
					href &&
					href.startsWith("/") &&
					!href.startsWith("//") &&
					targetAttr !== "_blank" &&
					!event.metaKey &&
					!event.ctrlKey &&
					!event.shiftKey &&
					!event.altKey
				) {
					const currentPathname = window.location.pathname;
					const targetPath = href.split("?")[0].split("#")[0];

					// Prevent triggering loader if navigating to the current page
					if (currentPathname !== targetPath) {
						setIsLoading(true);
					}
				}
			}
		};

		const handlePopState = () => {
			setIsLoading(true);
		};

		const handleNavigationStart = () => {
			setIsLoading(true);
		};

		document.addEventListener("click", handleAnchorClick, { capture: true });
		window.addEventListener("popstate", handlePopState);
		window.addEventListener("navigation-start", handleNavigationStart);

		return () => {
			document.removeEventListener("click", handleAnchorClick, { capture: true });
			window.removeEventListener("popstate", handlePopState);
			window.removeEventListener("navigation-start", handleNavigationStart);
		};
	}, [pathname]);

	return isLoading ? <PageLoader /> : null;
}
