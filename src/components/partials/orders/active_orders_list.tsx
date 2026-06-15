"use client";

import { useLanguage } from "@/config/i18n";
import CancelIcon from "../../icons/CancelIcon";

interface Order {
    id: string;
    item_name: string;
    item_price: number;
    quantity: number;
    accepted?: boolean;
    created_at?: string;
    createdAt?: string; // Fallback for older data
}

interface ActiveOrdersListProps {
    title: string;
    orders: Order[];
    currencyLabel: string;
    noItemsLabel: string;
    btnCancelTitle: string;
    onCancelOrder: (id: string, name: string) => void;
}

export default function ActiveOrdersList({
    title,
    orders,
    currencyLabel,
    noItemsLabel,
    btnCancelTitle,
    onCancelOrder,
}: ActiveOrdersListProps) {
    const { t, isRtl } = useLanguage();

    return (
        <div className="rounded-card border border-white/10 bg-surface p-5.5 shadow-xl space-y-4">
            <h3 className="text-sm font-black text-white border-b border-white/5 pb-3 flex items-center justify-between">
                <span>{title}</span>
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black bg-[#0d0f17] text-zinc-400 border border-white/5">
                    {orders.length}
                </span>
            </h3>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {orders.length > 0 ? (
                    orders.map((o) => {
                        const dateStr = o.created_at || o.createdAt || "";
                        const timeStr = dateStr;

                        return (
                            <div
                                key={o.id}
                                className="p-3 rounded-2xl bg-[#0d0f17]/60 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group/item hover:border-white/10 transition-all"
                            >
                                <div className="space-y-1">
                                    <p className="text-xs font-black text-white group-hover/item:text-primary-light transition-colors leading-snug">
                                        {o.item_name}
                                    </p>
                                    <p className="text-[10px] text-zinc-400 font-bold flex items-center gap-1 justify-start">
                                        <span dir="ltr" className="inline-block font-sans">
                                            {isRtl ? `${o.item_price.toLocaleString("en-US")} x ${o.quantity}` : `${o.quantity} x ${o.item_price.toLocaleString("en-US")}`}
                                        </span>
                                        <span>{currencyLabel}</span>
                                    </p>
                                    <p className="text-[9px] text-zinc-500 font-medium font-mono" dir="ltr">
                                        {timeStr}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-2 border-t border-white/5 pt-2 sm:border-t-0 sm:pt-0">
                                    <div className="flex items-center gap-2 md:flex-col justify-between w-full lg:gap-4">
                                        {o.accepted ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black bg-green-500/10 border border-green-500/20 text-green-400">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                                {t("orders.statusApproved")}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black bg-primary/10 border border-primary/20 text-primary-hover">
                                                <span className="w-1.5 h-1.5 rounded-full bg-primary-hover animate-pulse" />
                                                {t("orders.statusPending")}
                                            </span>
                                        )}

                                        <span className="text-xs font-black text-primary-hover shrink-0">
                                            {(
                                                o.item_price * o.quantity
                                            ).toLocaleString("en-US")}{" "}
                                            {currencyLabel}
                                        </span>
                                    </div>

                                    {!o.accepted && (
                                        <button
                                            onClick={() =>
                                                onCancelOrder(o.id, o.item_name)
                                            }
                                            className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 hover:bg-red-500 hover:text-white transition-all shrink-0 cursor-pointer"
                                            title={btnCancelTitle}
                                        >
                                            <CancelIcon className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="py-10 text-center text-zinc-600 font-medium text-xs italic">
                        {noItemsLabel}
                    </div>
                )}
            </div>
        </div>
    );
}
