import React from "react";
import { IconProps } from "./types";

const SunIcon: React.FC<IconProps> = ({ className, ...props }) => (
 <svg 
 className={className} 
 fill="none" 
 stroke="currentColor" 
 viewBox="0 0 24 24" 
 xmlns="http://www.w3.org/2000/svg"
 {...props}
 >
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
 </svg>
);

export default SunIcon;
