import React from "react";
import { IconProps } from "./types";

const ServerIcon: React.FC<IconProps> = ({ className, ...props }) => (
    <svg 
        className={className} 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24" 
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 8H6a2 2 0 00-2 2v6a4 4 0 004 4h8a4 4 0 004-4v-6a2 2 0 00-2-2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M22 10a2 2 0 01-2 2h-2V8h2a2 2 0 012 2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 2v2M10 2v2M14 2v2" />
    </svg>
);

export default ServerIcon;
