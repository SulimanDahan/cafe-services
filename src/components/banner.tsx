// components/ui/InfoBanner.tsx
interface BannerProps {
    title: string;
    desc: string;
    icon?: React.ReactNode;
}

export const Banner = ({ title, desc, icon }: BannerProps) => {
    return (
        <div className="p-6 rounded-3xl bg-[#131522] border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl transition-all duration-300 hover:border-amber-500/30">
            <div className="flex items-start gap-4">
                <div className="h-11 w-11 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 flex items-center justify-center font-bold text-sm shrink-0 shadow-md">
                    {icon}
                </div>
                <div className="space-y-1">
                    <h4 className="font-extrabold text-sm text-white tracking-wide">
                        {title}
                    </h4>
                    <p className="text-xs text-zinc-300 font-medium leading-relaxed">
                        {desc}
                    </p>
                </div>
            </div>
        </div>
    );
};
