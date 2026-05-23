"use client";

import React from "react";
import { PlusIcon } from "@/components/icons";

interface MenuItem {
	id: string;
	name: string;
	price: number | string;
	group?: {
		id: string;
		name: string;
	};
}

/**
 * Properties for the MenuItemCard component.
 */
interface MenuItemCardProps {
	/** The menu item data containing ID, name, price, and group details */
	item: MenuItem;
	/** Current selected quantity for this item */
	quantity: number;
	/** Callback function to adjust the item quantity */
	onAdjustQuantity: (amount: number) => void;
	/** Callback function triggered when placing the order */
	onPlaceOrder: () => void;
	/** Display label for the currency (e.g., YER, USD) */
	currencyLabel: string;
	/** Display label for the Add Order button */
	addOrderLabel: string;
}

/**
 * Renders a premium, glassmorphic card for a menu item.
 * Includes interactive quantity adjusters, dynamic hover effects, and call-to-actions.
 */
export default function MenuItemCard({
	item,
	quantity,
	onAdjustQuantity,
	onPlaceOrder,
	currencyLabel,
	addOrderLabel,
}: MenuItemCardProps) {
	return (
		<div className="rounded-3xl border border-white/10 bg-[#131522] p-5.5 hover:border-amber-500/30 transition-all duration-300 flex flex-col justify-between gap-4 group shadow-md">
			<div className="space-y-2">
				<div className="flex justify-between items-start gap-2">
					<span className="px-2.5 py-1 rounded-full text-[9px] font-black bg-[#0d0f17] text-amber-400/90 border border-white/5">
						{item.group?.name}
					</span>
					<span className="text-xs font-black text-amber-400">
						{Number(item.price).toLocaleString("en-US")} {currencyLabel}
					</span>
				</div>
				<h3 className="text-sm font-black text-white group-hover:text-amber-300 transition-colors">
					{item.name}
				</h3>
			</div>
			<div className="pt-2 border-t border-white/5 flex items-center justify-between gap-3">
				<div className="flex items-center bg-[#0d0f17] border border-white/10 rounded-full p-0.5 shrink-0">
					<button
						type="button"
						onClick={() => onAdjustQuantity(-1)}
						className="h-7 w-7 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/5 font-extrabold transition-all"
					>
						-
					</button>
					<span className="w-8 text-center text-xs font-black text-white">
						{quantity}
					</span>
					<button
						type="button"
						onClick={() => onAdjustQuantity(1)}
						className="h-7 w-7 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/5 font-extrabold transition-all"
					>
						+
					</button>
				</div>
				<button
					onClick={onPlaceOrder}
					className="flex-1 py-2.5 px-4 rounded-full bg-amber-500 hover:bg-amber-400 text-[#07080a] font-black text-xs transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
				>
					<PlusIcon className="w-3.5 h-3.5" />
					<span>{addOrderLabel}</span>
				</button>
			</div>
		</div>
	);
}
