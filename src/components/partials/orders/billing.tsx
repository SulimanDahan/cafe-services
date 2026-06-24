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
        <div className="rounded-card border border-primary/30 bg-surface-accent/90 p-6 shadow-2xl relative overflow-hidden flex flex-col gap-4">
            <div className="absolute top-0 left-0 w-32 h-32 bg-primary/10 blur-[60px] pointer-events-none" />

            <div>
                <span className="text-[10px] font-black text-primary-hover/90 tracking-widest uppercase">
                    {basketTotalLabel}
                </span>
                <h3 className="text-3xl font-black text-foreground mt-1">
                    {totalBill.toLocaleString("en-US")}
                    <span className="text-sm font-black text-primary-hover">
                        {currencyLabel}
                    </span>
                </h3>
            </div>

            <div className="divide-y divide-border-light text-xs">
                <div className="py-2.5 flex justify-between">
                    <span className="opacity-70 text-foreground">{guestNameLabel}</span>
                    <span className="font-bold text-foreground">{clientName}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                    <span className="opacity-70 text-foreground">{totalOrderedLabel}</span>
                    <span className="font-bold text-foreground">
                        {totalQuantity}
                    </span>
                </div>
            </div>
        </div>
    );
}
