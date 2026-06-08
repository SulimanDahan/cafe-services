import React from "react";
import { IconProps } from "./types";

/**
 * DisableIcon — A circle with a diagonal slash, representing deactivation or disabling.
 * Distinct from UndoCircleIcon which represents an undo/revert action.
 */
const DisableIcon: React.FC<IconProps> = ({ className, ...props }) => (
    <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        {/* Outer circle */}
        <circle cx="12" cy="12" r="9" strokeWidth="2" />
        {/* Diagonal slash from top-left to bottom-right */}
        <line x1="5.636" y1="5.636" x2="18.364" y2="18.364" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

export default DisableIcon;
