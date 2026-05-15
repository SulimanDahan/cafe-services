// components/cards/ServiceCard.tsx
interface CardProps {
    name: string;
    desc: string;
    price: string;
    status: string;
    rating: string;
    iconSvg: React.ReactNode;
    isActive: boolean;
    onHover: (id: string | null) => void;
    id: string;
    activeText: string;
}

export const Card = ({ id, name, desc, price, status, rating, iconSvg, isActive, onHover, activeText }: CardProps) => {
    return (
        <div
            onMouseEnter={() => onHover(id)}
            onMouseLeave={() => onHover(null)}
            className={`group relative rounded-[28px] border bg-[#131522] p-6.5 transition-all duration-300 active:scale-[0.98] cursor-pointer shadow-lg hover:shadow-2xl flex flex-col justify-between ${
                isActive ? "border-amber-400/50 bg-[#1a1c2c] -translate-y-1 shadow-amber-500/5" : "border-white/10"
            }`}
        >
            <div>
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center border transition-all duration-300 shadow-md shrink-0 ${
                            isActive ? "bg-amber-500/30 border-amber-500/50" : "bg-amber-500/20 border-amber-500/30"
                        }`}>
                            {iconSvg}
                        </div>
                        <div>
                            <h3 className="font-black text-sm sm:text-base text-white group-hover:text-amber-300 transition-colors duration-200 leading-tight">
                                {name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1.5">
                                <span className="text-xs font-bold text-amber-400">{price}</span>
                                <span className="text-zinc-600 text-xs">•</span>
                                <span className="text-[10px] text-zinc-400 font-extrabold flex items-center gap-0.5">
                                    <svg className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                    {rating}
                                </span>
                            </div>
                        </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold border shadow-sm transition-colors duration-200 ${
                        status === activeText ? "bg-amber-500/20 text-amber-300 border-amber-500/40" : "bg-zinc-800 text-zinc-400 border-white/10"
                    }`}>
                        {status}
                    </span>
                </div>
                <p className="text-xs text-zinc-300 mt-4 leading-relaxed font-medium">{desc}</p>
            </div>
        </div>
    );
};