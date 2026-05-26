import React from "react";
import ChevronDownIcon from "@/components/icons/ChevronDownIcon";

// components/ui/InputField.tsx
interface InputFieldProps extends React.InputHTMLAttributes<
    HTMLInputElement | HTMLSelectElement
> {
    label?: string;
    isSelect?: boolean;
    options?: { id: string; name: string }[];
}

export const InputField = React.forwardRef<
    HTMLInputElement | HTMLSelectElement,
    InputFieldProps
>(({ label, isSelect, options, ...props }, ref) => {
    const className =
        "w-full bg-background border border-white/10 text-white rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-all duration-200";

    return (
        <div className="space-y-1.5 w-full">
            {label && (
                <label className="text-xs font-bold text-zinc-400 block">
                    {label}
                </label>
            )}
            {isSelect ? (
                <div className="relative">
                    <select
                        ref={ref as React.Ref<HTMLSelectElement>}
                        className={`${className} appearance-none cursor-pointer`}
                        {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}
                    >
                        {options?.map((opt) => (
                            <option
                                key={opt.id}
                                value={opt.id}
                                className="bg-[#0d0f17] text-white font-bold p-2"
                            >
                                {opt.name}
                            </option>
                        ))}
                    </select>
                    <div className="absolute top-1/2 -translate-y-1/2 ltr:right-4 rtl:left-4 pointer-events-none text-zinc-500">
                        <ChevronDownIcon className="w-4 h-4" />
                    </div>
                </div>
            ) : (
                <input
                    ref={ref as React.Ref<HTMLInputElement>}
                    className={className}
                    {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
                />
            )}
        </div>
    );
});

InputField.displayName = "InputField";
