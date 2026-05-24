import { SVGProps } from "react";

export default function BoxIcon(props: SVGProps<SVGSVGElement>) {
 return (
 <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
 </svg>
 );
}
