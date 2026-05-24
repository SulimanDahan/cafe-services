import React from "react";
import { IconProps } from "./types";

const PlusIcon: React.FC<IconProps> = ({ className, ...props }) => (
 <svg 
 className={className} 
 fill="none" 
 stroke="currentColor" 
 viewBox="0 0 24 24" 
 xmlns="http://www.w3.org/2000/svg"
 {...props}
 >
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
 </svg>
);

export default PlusIcon;
