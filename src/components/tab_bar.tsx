"use client";

import React from "react";

/**
 * Tab definition for the TabBar component.
 */
interface TabItem {
	/** Unique identifier for the tab */
	id: string;
	/** Text display label for the tab */
	label: string;
	/** Optional icon node to render beside the label */
	icon?: React.ReactNode;
}

/**
 * Properties for the TabBar component.
 */
interface TabBarProps {
	/** Array of tabs with id, label, and optional icon properties */
	tabs: TabItem[];
	/** Currently active tab ID */
	activeTab: string;
	/** Callback function triggered when a tab is selected */
	onChange: (id: string) => void;
}

/**
 * Renders a premium, glassmorphic, rounded-full tab bar.
 * Complies with Material Design 3 and is styled with sleek hover/focus micro-animations.
 */
export default function TabBar({ tabs, activeTab, onChange }: TabBarProps) {
	const handleTabClick = (e: React.MouseEvent<HTMLButtonElement>, id: string) => {
		onChange(id);
		e.currentTarget.scrollIntoView({
			behavior: "smooth",
			inline: "center",
			block: "nearest",
		});
	};

	return (
		<div className="flex flex-nowrap gap-2 p-1 bg-[#07080a]/60 border border-white/10 rounded-full w-fit max-w-full overflow-x-auto backdrop-blur-xl shadow-inner [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
			{tabs.map((tab) => (
				<button
					key={tab.id}
					type="button"
					onClick={(e) => handleTabClick(e, tab.id)}
					className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-black transition-all duration-300 cursor-pointer whitespace-nowrap shrink-0 ${
						activeTab === tab.id
							? "bg-amber-500 text-[#07080a] shadow-lg shadow-amber-500/20 scale-[1.02]"
							: "text-zinc-400 hover:text-white hover:bg-white/5"
					}`}
				>
					{tab.icon && <span className="shrink-0">{tab.icon}</span>}
					<span>{tab.label}</span>
				</button>
			))}
		</div>
	);
}
