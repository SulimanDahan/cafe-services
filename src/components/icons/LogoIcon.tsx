import React from "react";
import { IconProps } from "./types";

const LogoIcon: React.FC<IconProps> = ({ className, ...props }) => (
    <svg 
        className={className} 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24" 
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 3v1m0 16v1m9-9h-1M4 12H3" />
    </svg>
);

export default LogoIcon;
