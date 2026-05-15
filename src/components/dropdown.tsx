import { PropsWithChildren } from "react";

const Dropdown = ({ children, ...props }: PropsWithChildren) => {
    return (
        <select
            className="bg-[#07080a] border border-white/10 text-zinc-300 rounded-full px-4 py-2.5 text-xs focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40 transition-all duration-200"
            {...props}
        >
            {children}
        </select >
    )
}

export default Dropdown