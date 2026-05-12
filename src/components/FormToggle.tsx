"use client";

interface FormToggleProps {
	/** Toggle checked status boolean */
	checked: boolean;
	/** Callback function triggered on toggled status changes */
	onChange: (checked: boolean) => void;
	/** Label text for the toggle option */
	label: string;
	/** Optional helper subtitle context below the label */
	description?: string;
}

/**
 * Premium custom toggle switch slider conforming to Material You layout guidelines.
 */
export default function FormToggle({ checked, onChange, label, description }: FormToggleProps) {
	return (
		<div className="flex items-center justify-between p-3.5 rounded-2xl border border-white/10 bg-[#07080a]/40 w-full">
			<div className="flex flex-col pl-4">
				<span className="text-xs font-black text-white">{label}</span>
				{description && <span className="text-[10px] text-zinc-500 font-bold mt-0.5">{description}</span>}
			</div>
			<label className="relative inline-flex items-center cursor-pointer shrink-0">
				<input
					type="checkbox"
					checked={checked}
					onChange={(e) => onChange(e.target.checked)}
					className="sr-only peer"
				/>
				<div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:content-[''] after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500 peer-checked:after:bg-black peer-checked:after:border-transparent"></div>
			</label>
		</div>
	);
}
