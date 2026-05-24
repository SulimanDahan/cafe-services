import React from "react";
import { IconProps } from "./types";

const ArrowIcon: React.FC<IconProps> = ({ className, ...props }) => (
 <svg 
 className={className} 
 fill="none" 
 stroke="currentColor" 
 viewBox="0 0 24 24" 
 xmlns="http://www.w3.org/2000/svg"
 {...props}
 >
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
 </svg>
);

export default ArrowIcon;
