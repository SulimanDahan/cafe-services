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
>(({ label, isSelect, options, className: customClassName, ...props }, ref) => {
    const baseClassName =
        "w-full bg-background border border-border text-foreground rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-all duration-200" +
        (props.type === "date" || props.type === "time" ? " [&::-webkit-calendar-picker-indicator]:invert-[0.8]" : "");

    return (
        <div className="space-y-1.5 w-full">
            {label && (
                <label className="text-xs font-bold text-foreground-muted block">
                    {label}
                </label>
            )}
            {isSelect ? (
                <div className="relative">
                    <select
                        ref={ref as React.Ref<HTMLSelectElement>}
                        className={`${baseClassName} appearance-none cursor-pointer ${customClassName || ""}`}
                        {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}
                    >
                        {options?.map((opt) => (
                            <option
                                key={opt.id}
                                value={opt.id}
                                className="bg-surface-darker text-foreground font-bold p-2"
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
                    className={`${baseClassName} ${customClassName || ""}`}
                    style={{ ...(props.type === "date" || props.type === "time" ? { colorScheme: "dark" } : {}), ...props.style }}
                    {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
                />
            )}
        </div>
    );
});

InputField.displayName = "InputField";
