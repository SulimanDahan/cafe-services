import { PropsWithChildren } from "react";

const Dropdown = ({ children, ...props }: PropsWithChildren) => {
 return (
 <select
 className="bg-background border border-white/10 text-zinc-300 rounded-full px-4 py-2.5 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all duration-200"
 {...props}
 >
 {children}
 </select >
 )
}

export default Dropdown