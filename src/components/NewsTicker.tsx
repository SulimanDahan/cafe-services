"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/config/i18n";

interface NewsItem {
    id: string;
    news_text: string;
}

export default function NewsTicker() {
    const { isRtl } = useLanguage();
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                // Prevent aggressive browser caching on mobile devices by adding cache: no-store and a timestamp
                const res = await fetch(`/api/news/public?t=${new Date().getTime()}`, {
                    cache: "no-store",
                    headers: {
                        "Cache-Control": "no-cache, no-store, must-revalidate",
                        Pragma: "no-cache",
                    },
                });
                if (res.ok) {
                    const result = await res.json();
                    if (result.success && Array.isArray(result.data)) {
                        setNews(result.data);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch news ticker data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
        // Poll every 60 seconds
        const interval = setInterval(fetchNews, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!loading) {
            if (news.length > 0) {
                // News ticker height is roughly 36px (top-9) for mobile, top-11.5 for desktop
                document.documentElement.style.setProperty('--ticker-offset-mobile', '2.25rem');
                document.documentElement.style.setProperty('--ticker-offset-desktop', '2.875rem');
            } else {
                document.documentElement.style.setProperty('--ticker-offset-mobile', '0px');
                document.documentElement.style.setProperty('--ticker-offset-desktop', '0px');
            }
        }
        return () => {
            document.documentElement.style.setProperty('--ticker-offset-mobile', '0px');
            document.documentElement.style.setProperty('--ticker-offset-desktop', '0px');
        }
    }, [news.length, loading]);

    if (loading || news.length === 0) return null;

    // Combine news texts with a spacer
    const separator = "     •     ";
    const tickerText = news.map((item) => item.news_text).join(separator);

    return (
        <div
            className="sticky top-0 left-0 right-0 w-full overflow-hidden bg-[#07080a] border-b border-white/10 pt-[max(env(safe-area-inset-top,0px),8px)] pb-2 px-4 shadow-lg flex items-center gap-3 animate-fade-in z-100"
            dir={isRtl ? "rtl" : "ltr"}
        >
            {/* Glowing Accent Border */}
            <div className="absolute inset-x-0 bottom-0 border-b border-primary/20 pointer-events-none" />

            {/* Scrolling Ticker Area */}
            <div
                className="relative flex-1 overflow-hidden h-5 flex items-center select-none"
                dir="ltr"
            >
                <div
                    className="whitespace-nowrap inline-block hover:[animation-play-state:paused] cursor-pointer text-xs font-semibold text-zinc-300 hover:text-white transition-colors duration-200"
                    style={{
                        animationName: isRtl ? "marqueeRTL" : "marqueeLTR",
                        animationDuration: `${Math.max(12, tickerText.length * 0.18)}s`,
                        animationTimingFunction: "linear",
                        animationIterationCount: "infinite",
                        willChange: "transform",
                    }}
                    dir={isRtl ? "rtl" : "ltr"}
                >
                    {tickerText}
                </div>
            </div>

        </div>
    );
}
