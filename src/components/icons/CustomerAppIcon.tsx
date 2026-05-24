import { SVGProps } from "react";

export default function CustomerAppIcon(props: SVGProps<SVGSVGElement>) {
 return (
 <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth="2"
 d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707"
 />
 </svg>
 );
}
