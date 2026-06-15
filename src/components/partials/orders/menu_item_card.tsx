"use client";

import PlusIcon from "@/components/icons/PlusIcon";
import LogoIcon from "@/components/icons/LogoIcon";
import Image from "next/image";

interface MenuItem {
    id: string;
    name: string;
    price: number | string;
    image?: string | null;
    discount_percentage?: number;
    discount_value?: number;
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
    note?: string;
    /** Callback function to handle note changes */
    onChangeNote?: (note: string) => void;
    /** Placeholder for the note input */
    notePlaceholder?: string;
    /** Whether to show the item image */
    showImage?: boolean;
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
    note = "",
    onChangeNote,
    notePlaceholder,
    showImage = true,
}: MenuItemCardProps) {
    return (
        <div className="rounded-[20px] border border-white/10 bg-surface p-3 hover:border-primary/30 transition-all duration-300 flex flex-col gap-3 group shadow-md overflow-hidden h-full">

            {/* Top: Image + Info (Horizontal on mobile/tablet, Vertical on lg) */}
            <div className="flex flex-row lg:flex-col items-center gap-3 lg:gap-2 w-full text-start lg:text-center">
                {/* Small Image */}
                {showImage && (
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-[14px] lg:rounded-full shrink-0 bg-surface-lighter flex items-center justify-center overflow-hidden shadow-sm border border-white/5 lg:mb-1">
                        {item.image ? (
                            <>
                                <Image
                                    src={item.image}
                                    alt={item.name}
                                    fill
                                    className="object-cover transition-transform group-hover:scale-110"
                                    sizes="96px"
                                />
                                <div className="absolute inset-0 bg-black/20 pointer-events-none" />
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity duration-300 w-full h-full bg-[#0d0f17]">
                                <LogoIcon className="w-10 h-10 text-white transition-all" />
                            </div>
                        )}
                    </div>
                )}

                {/* Info */}
                <div className="flex flex-col justify-center lg:items-center space-y-1.5 flex-1 min-w-0 w-full lg:px-1">
                    <div className="flex justify-between items-start gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black bg-[#0d0f17] text-primary-hover/90 border border-white/5 inline-block shrink-0">
                            {item.group?.name}
                        </span>
                    </div>
                    <h3 className="text-sm font-black text-white group-hover:text-primary-light transition-colors line-clamp-2 leading-snug w-full wrap-break-word">
                        {item.name}
                    </h3>
                    {Number(item.price) > 0 && (
                        <div className="mt-0.5 flex flex-col lg:items-center">
                            {((item.discount_percentage ?? 0) > 0 || (item.discount_value ?? 0) > 0) ? (
                                <div className="flex flex-col items-start lg:items-center">
                                    <span className="text-[10px] font-bold text-zinc-500 line-through flex items-center gap-1">
                                        <span dir="ltr" className="inline-block font-sans">{Number(item.price).toLocaleString("en-US")}</span>
                                        <span>{currencyLabel}</span>
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-xs font-black text-amber-500 flex items-center gap-1">
                                            <span dir="ltr" className="inline-block font-sans">
                                                {Math.max(0, Number(item.price) - Number(item.discount_value || 0) - (Number(item.price) * (Number(item.discount_percentage || 0) / 100))).toLocaleString("en-US")}
                                            </span>
                                            <span>{currencyLabel}</span>
                                        </span>
                                        {Number(item.discount_percentage || 0) > 0 && (
                                            <span className="px-1.5 py-0.5 rounded-sm bg-amber-500/10 text-amber-500 text-[9px] font-black border border-amber-500/20">
                                                -{item.discount_percentage}%
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <span className="text-xs font-black text-primary-hover flex items-center lg:justify-center gap-1">
                                    <span dir="ltr" className="inline-block font-sans">{Number(item.price).toLocaleString("en-US")}</span>
                                    <span>{currencyLabel}</span>
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Spacer to push actions to bottom if container grows */}
            <div className="flex-1" />

            {/* Note Input */}
            {onChangeNote && (
                <div className="w-full">
                    <textarea
                        value={note}
                        onChange={(e) => onChangeNote(e.target.value)}
                        placeholder={notePlaceholder || "أضف ملاحظة (اختياري)..."}
                        rows={1}
                        className="w-full bg-black/40 border border-white/15 hover:border-white/25 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-400 focus:outline-hidden focus:border-primary/60 focus:ring-1 focus:ring-primary/60 focus:bg-[#0d0f17] transition-all resize-none shadow-inner"
                    />
                </div>
            )}

            {/* Actions (Adaptive Row on mobile/tablet, Stacked on lg) */}
            <div className="pt-2 border-t border-white/5 flex flex-wrap lg:flex-col items-center gap-2 mt-auto">
                <div className="flex items-center justify-between bg-[#0d0f17] border border-white/10 rounded-full p-1 shadow-inner shrink-0 w-32 lg:w-full">
                    <button
                        type="button"
                        onClick={() => onAdjustQuantity(-1)}
                        className="h-7 w-7 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 text-lg font-black transition-all shrink-0 cursor-pointer"
                    >
                        -
                    </button>
                    <span className="flex-1 text-center text-xs font-black text-white px-1 truncate">
                        {quantity}
                    </span>
                    <button
                        type="button"
                        onClick={() => onAdjustQuantity(1)}
                        className="h-7 w-7 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 text-lg font-black transition-all shrink-0 cursor-pointer"
                    >
                        +
                    </button>
                </div>
                <button
                    onClick={onPlaceOrder}
                    className="flex-1 min-w-30 lg:w-full lg:min-w-0 py-2 px-2 rounded-full bg-primary hover:bg-primary-hover text-background font-black text-xs transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 shadow-md flex items-center justify-center gap-1.5 cursor-pointer h-9 shrink-0"
                >
                    <PlusIcon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate whitespace-nowrap">{addOrderLabel}</span>
                </button>
            </div>
        </div>
    );
}
