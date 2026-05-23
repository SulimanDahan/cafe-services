import { ButtonHTMLAttributes } from "react";

type ActionVariant = "edit" | "delete" | "disable" | "enable" | "accept";

interface ActionIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant: ActionVariant;
    icon: React.ReactNode;
}

export function ActionIconButton({
    variant,
    icon,
    className = "",
    ...props
}: ActionIconButtonProps) {
    const baseStyles = "p-1.5 rounded-lg border transition-all duration-200 flex items-center justify-center";
    
    const variants = {
        edit: "bg-zinc-800 border-white/10 text-zinc-400 hover:bg-amber-500/10 hover:border-amber-500/30 hover:text-amber-300",
        delete: "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white",
        disable: "bg-zinc-800 border-white/10 text-zinc-400 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400",
        enable: "bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500 hover:text-[#07080a]",
        accept: "bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500 hover:text-white",
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${className}`}
            {...props}
        >
            {icon}
        </button>
    );
}
