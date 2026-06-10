import { IconProps } from "./types";

export default function EmptyReportsIcon({ size = 80, className, ...props }: IconProps) {
	return (
        <svg 
            width={size}
            height={size}
            className={className} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0"></path>
        </svg>
	);
}
