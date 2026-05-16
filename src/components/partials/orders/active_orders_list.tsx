"use client";

interface Order {
    id: string;
    item_name: string;
    item_price: number;
    quantity: number;
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
    return (
        <div className="rounded-[28px] border border-white/10 bg-[#131522] p-5.5 shadow-xl space-y-4">
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
                        const timeStr = dateStr.includes(" ")
                            ? dateStr.split(" ").slice(2).join(" ")
                            : dateStr;

                        return (
                            <div
                                key={o.id}
                                className="p-3 rounded-2xl bg-[#0d0f17]/60 border border-white/5 flex items-center justify-between gap-3 group/item hover:border-white/10 transition-all"
                            >
                                <div className="space-y-1">
                                    <p className="text-xs font-black text-white group-hover/item:text-amber-300 transition-colors leading-snug">
                                        {o.item_name}
                                    </p>
                                    <p className="text-[10px] text-zinc-400 font-bold">
                                        {o.quantity} × {o.item_price.toLocaleString("en-US")} {currencyLabel}
                                    </p>
                                    <p className="text-[9px] text-zinc-500 font-medium font-mono">
                                        {timeStr}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-black text-amber-400 shrink-0">
                                        {(o.item_price * o.quantity).toLocaleString("en-US")} {currencyLabel}
                                    </span>

                                    <button
                                        onClick={() => onCancelOrder(o.id, o.item_name)}
                                        className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 hover:bg-red-500 hover:text-white transition-all shrink-0 active:scale-95"
                                        title={btnCancelTitle}
                                    >
                                        <svg
                                            className="w-3.5 h-3.5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2.5"
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </button>
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