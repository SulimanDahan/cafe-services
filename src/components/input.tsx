import React from "react";

// components/ui/InputField.tsx
interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement> {
    label: string;
    isSelect?: boolean;
    options?: { id: string; name: string }[];
}

export const InputField = React.forwardRef<HTMLInputElement | HTMLSelectElement, InputFieldProps>(
    ({ label, isSelect, options, ...props }, ref) => {
        const className = "w-full bg-[#07080a] border border-white/10 text-white rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition-all duration-200";

        return (
            <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-400 block">{label}</label>
                {isSelect ? (
                    <select
                        ref={ref as React.Ref<HTMLSelectElement>}
                        className={className}
                        {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}
                    >
                        {options?.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                    </select>
                ) : (
                    <input
                        ref={ref as React.Ref<HTMLInputElement>}
                        className={className}
                        {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
                    />
                )}
            </div>
        );
    }
);

InputField.displayName = "InputField";