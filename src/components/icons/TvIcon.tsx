export default function TvIcon({ className = "" }: { className?: string }) {
    return (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <rect x="2" y="7" width="20" height="15" rx="2" ry="2" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 2l-5 5-5-5" />
        </svg>
    );
}
