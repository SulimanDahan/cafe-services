export default function HookahIcon({ className = "" }: { className?: string }) {
    return (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
        >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 2h4v2h-4zM11 4v6h2V4M9 10h6v2H9zM7 12c0 2 2 5 2 8h6c0-3 2-6 2-8H7zM7 16c-3 0-5-2-4-5" />
        </svg>
    );
}
