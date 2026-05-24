// components/cards/ServiceCard.tsx
import StarIcon from "./icons/StarIcon";
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
 className={`group relative rounded-card border bg-surface p-6.5 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-2xl flex flex-col justify-between ${
 isActive ? "border-primary-hover/50 bg-[#1a1c2c] -translate-y-1 shadow-primary/5" : "border-white/10"
 }`}
 >
 <div>
 <div className="flex items-start justify-between gap-4">
 <div className="flex items-center gap-4">
 <div className={`h-12 w-12 rounded-2xl flex items-center justify-center border transition-all duration-300 shadow-md shrink-0 ${
 isActive ? "bg-primary/30 border-primary/50" : "bg-primary/20 border-primary/30"
 }`}>
 {iconSvg}
 </div>
 <div>
 <h3 className="font-black text-sm sm:text-base text-white group-hover:text-primary-light transition-colors duration-200 leading-tight">
 {name}
 </h3>
 <div className="flex items-center gap-2 mt-1.5">
 <span className="text-xs font-bold text-primary-hover">{price}</span>
 <span className="text-zinc-600 text-xs">•</span>
 <span className="text-[10px] text-zinc-400 font-extrabold flex items-center gap-0.5">
 <StarIcon className="w-3 h-3 text-primary-hover" />
 {rating}
 </span>
 </div>
 </div>
 </div>
 <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold border shadow-sm transition-colors duration-200 ${
 status === activeText ? "bg-primary/20 text-primary-light border-primary/40" : "bg-zinc-800 text-zinc-400 border-white/10"
 }`}>
 {status}
 </span>
 </div>
 <p className="text-xs text-zinc-300 mt-4 leading-relaxed font-medium">{desc}</p>
 </div>
 </div>
 );
};