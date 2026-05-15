import { PropsWithChildren } from "react";

// components/ui/Badge.tsx
interface BadgeProps extends PropsWithChildren {
    children: React.ReactNode;
    variant?: "amber" | "zinc";
    pulse?: boolean;
}

export const Badge = ({ children, variant = "amber", pulse, ...rest }: BadgeProps) => {
    const styles = {
        amber: "bg-amber-500/10 border-amber-500/30 text-amber-300",
        zinc: "bg-zinc-800 text-zinc-400 border-white/10",
    };

    return (
        <span
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black border shadow-md ${styles[variant]}`}
            {...rest}
        >
            {pulse && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
            {children}
        </span>
    );
};
