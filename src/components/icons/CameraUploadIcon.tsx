import { IconProps } from "./types";

export default function CameraUploadIcon({ size = 24, className, ...props }: IconProps) {
	return (
        <svg 
            width={size}
            height={size}
            className={className} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
            <circle cx="12" cy="13" r="4"></circle>
        </svg>
	);
}
