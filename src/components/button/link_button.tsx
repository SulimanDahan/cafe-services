'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";

type LinkButtonProps = {
 route: string;
 text: string;
};

const LinkButton = ({ route, text }: LinkButtonProps) => {
 const pathname = usePathname();
 const isActive = pathname === route;

 return (
 <Link
 href={route}
 className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all 
 ${
 isActive
 ? "bg-primary/10 text-primary-light border border-primary/30 shadow-md"
 : "text-zinc-400 hover:text-white border border-zinc-400"
 }`}
 >
 {text}
 </Link>
 );
};

export default LinkButton;
