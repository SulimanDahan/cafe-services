import React from "react";
import { IconProps } from "./types";

const CheckCircleIcon: React.FC<IconProps> = ({ className, ...props }) => (
 <svg 
 className={className} 
 fill="none" 
 stroke="currentColor" 
 viewBox="0 0 24 24" 
 xmlns="http://www.w3.org/2000/svg"
 {...props}
 >
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
);

export default CheckCircleIcon;
