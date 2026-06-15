"use client";

interface BillingProps {
    basketTotalLabel: string;
    totalBill: number;
    currencyLabel: string;
    guestNameLabel: string;
    clientName: string;
    totalOrderedLabel: string;
    totalQuantity: number;
}

export default function Billing({
    basketTotalLabel,
    totalBill,
    currencyLabel,
    guestNameLabel,
    clientName,
    totalOrderedLabel,
    totalQuantity,
}: BillingProps) {
    return (
        <div className="rounded-card border border-primary/30 bg-[#1a1c2c]/90 p-6 shadow-2xl relative overflow-hidden flex flex-col gap-4">
            <div className="absolute top-0 left-0 w-32 h-32 bg-primary/10 blur-[60px] pointer-events-none" />

            <div>
                <span className="text-[10px] font-black text-primary-hover/90 tracking-widest uppercase">
                    {basketTotalLabel}
                </span>
                <h3 className="text-3xl font-black text-white mt-1">
                    {totalBill.toLocaleString("en-US")}
                    <span className="text-sm font-black text-primary-hover">
                        {currencyLabel}
                    </span>
                </h3>
            </div>

            <div className="divide-y divide-white/5 text-xs text-zinc-300">
                <div className="py-2.5 flex justify-between">
                    <span>{guestNameLabel}</span>
                    <span className="font-bold text-white">{clientName}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                    <span>{totalOrderedLabel}</span>
                    <span className="font-bold text-white">
                        {totalQuantity}
                    </span>
                </div>
            </div>
        </div>
    );
}
