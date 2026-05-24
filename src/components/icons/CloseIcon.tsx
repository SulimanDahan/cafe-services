import React from "react";
import { IconProps } from "./types";

const CloseIcon: React.FC<IconProps> = ({ className, ...props }) => (
 <svg 
 className={className} 
 fill="none" 
 stroke="currentColor" 
 viewBox="0 0 24 24" 
 xmlns="http://www.w3.org/2000/svg"
 {...props}
 >
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
 </svg>
);

export default CloseIcon;
