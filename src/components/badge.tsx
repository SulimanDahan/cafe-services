import { PropsWithChildren } from "react";

interface BadgeProps extends PropsWithChildren {
	children: React.ReactNode;
	variant?: "amber" | "zinc" | "success" | "error" | "info" | "warning";
	pulse?: boolean;
	className?: string;
}

export const Badge = ({
	children,
	variant = "amber",
	pulse,
	className = "",
	...rest
}: BadgeProps) => {
	const styles = {
		amber: "bg-primary/10 border-primary/30 text-primary-light",
		warning: "bg-primary/10 border-primary/25 text-primary-light",
		zinc: "bg-zinc-800 text-zinc-400 border-white/10",
		success: "bg-green-500/10 border-green-500/20 text-green-400",
		error: "bg-red-500/10 border-red-500/20 text-red-400",
		info: "bg-blue-500/10 border-blue-500/20 text-blue-400",
	};

	const dotColors = {
		amber: "bg-primary-hover",
		warning: "bg-primary-hover animate-pulse",
		zinc: "bg-zinc-400",
		success: "bg-green-400",
		error: "bg-red-400",
		info: "bg-blue-400",
	};

	return (
		<span
			className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold border shadow-sm ${styles[variant]} ${className}`}
			{...rest}
		>
			{pulse && (
				<span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]} ${variant === "success" || variant === "error" ? "" : "animate-pulse"}`} />
			)}
			{children}
		</span>
	);
};

