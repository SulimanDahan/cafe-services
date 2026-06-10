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
 const baseStyles = "p-1.5 aspect-square rounded-lg border transition-all duration-200 flex items-center justify-center";
 
 const variants = {
 edit: "bg-zinc-800 border-white/10 text-zinc-400 hover:bg-primary/10 hover:border-primary/30 hover:text-primary-light",
 delete: "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white",
 disable: "bg-zinc-800 border-white/10 text-zinc-400 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400",
 enable: "bg-primary/10 border-primary/30 text-primary-light hover:bg-primary hover:text-background",
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
