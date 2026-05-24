import { SVGProps } from "react";

export default function CancelIcon(props: SVGProps<SVGSVGElement>) {
 return (
 <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
 </svg>
 );
}
