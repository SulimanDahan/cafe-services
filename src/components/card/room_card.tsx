"use client";

import { useLanguage } from "@/config/i18n";
import RoomModel from "@/models/data_models/room_model";
import ReservationModel from "@/models/data_models/reservation_model";
import { UserIcon } from "@/components/icons/user_icon";
import BuildingIcon from "@/components/icons/BuildingIcon";
import OrderIcon from "@/components/icons/OrderIcon";
import BellIcon from "@/components/icons/BellIcon";

interface RoomCardProps {
    room: RoomModel;
    reservation?: ReservationModel;
    unapprovedOrdersCount: number;
    unreadReportsCount: number;
    onClick: () => void;
}

export default function RoomCard({
    room,
    reservation,
    unapprovedOrdersCount,
    unreadReportsCount,
    onClick,
}: RoomCardProps) {
    const { t } = useLanguage();

    const isOccupied = reservation?.activated;
    const isAccepted = reservation?.accepted && !reservation?.activated;
    const isPending = reservation && !reservation?.accepted && !reservation?.activated;
    const isAvailable = !reservation;

    let statusText = t("reservations.roomAvailable") || "Available";

    // Tailwind-safe M3 Color Tokens
    let colorClasses = {
        accentBg: "bg-emerald-500",
        accentText: "text-emerald-500",
        iconBg: "bg-emerald-500/10",
        iconBorder: "border-emerald-500/20",
        shadowHover: "hover:shadow-emerald-500/10",
        strip: "border-s-emerald-500"
    };

    if (isOccupied) {
        statusText = t("reservations.roomOccupied") || "Occupied";
        colorClasses = {
            accentBg: "bg-rose-500",
            accentText: "text-rose-500",
            iconBg: "bg-rose-500/10",
            iconBorder: "border-rose-500/20",
            shadowHover: "hover:shadow-rose-500/10",
            strip: "border-s-rose-500"
        };
    } else if (isAccepted) {
        statusText = t("reservations.statusAccepted") || "Accepted";
        colorClasses = {
            accentBg: "bg-amber-500",
            accentText: "text-amber-500",
            iconBg: "bg-amber-500/10",
            iconBorder: "border-amber-500/20",
            shadowHover: "hover:shadow-amber-500/10",
            strip: "border-s-amber-500"
        };
    } else if (isPending) {
        statusText = t("reservations.statusPending") || "Pending";
        colorClasses = {
            accentBg: "bg-blue-500",
            accentText: "text-blue-500",
            iconBg: "bg-blue-500/10",
            iconBorder: "border-blue-500/20",
            shadowHover: "hover:shadow-blue-500/10",
            strip: "border-s-blue-500"
        };
    }

    return (
        <button
            onClick={onClick}
            className={`w-full text-start relative rounded-[28px] bg-[#131522] border border-white/5 border-s-4 ${colorClasses.strip} hover:-translate-y-1 hover:shadow-xl ${colorClasses.shadowHover} transition-all duration-300 cursor-pointer overflow-hidden group flex flex-col p-5 min-h-40`}
        >
            {/* Header: Icon & Room Name */}
            <div className="flex justify-between items-start w-full mb-6">
                <div className="flex items-center gap-4">
                    {/* Room/User Icon */}
                    <div className={`w-12 h-12 rounded-[20px] flex items-center justify-center border ${colorClasses.iconBg} ${colorClasses.iconBorder} group-hover:scale-105 transition-transform duration-300`}>
                        <BuildingIcon className={`w-6 h-6 ${colorClasses.accentText}`} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white tracking-wide">{room.name}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`w-2 h-2 rounded-full ${colorClasses.accentBg} ${isOccupied || isAvailable ? 'animate-pulse' : ''} shadow-[0_0_8px_currentColor] opacity-80`} />
                            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">{statusText}</span>
                        </div>
                    </div>
                </div>

                {/* Notifications Area (Top Right) */}
                <div className="flex flex-col gap-1.5">
                    {unapprovedOrdersCount > 0 && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 shadow-sm">
                            <OrderIcon className="w-3.5 h-3.5" strokeWidth={2.5} />
                            <span className="text-[11px] font-black">{unapprovedOrdersCount}</span>
                        </div>
                    )}
                    {unreadReportsCount > 0 && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 shadow-sm">
                            <BellIcon className="w-3.5 h-3.5" strokeWidth={2.5} />
                            <span className="text-[11px] font-black">{unreadReportsCount}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Client Details Section (Bottom) */}
            <div className="bg-[#07080a]/60 rounded-[20px] p-4 border border-white/5 mt-auto flex flex-col justify-center min-h-16 group-hover:bg-[#07080a]/80 transition-colors">
                {reservation && reservation.client_name ? (
                    <div className="flex flex-col gap-2 w-full">
                        <div className="flex items-center gap-2">
                            <UserIcon className="w-4 h-4 text-zinc-500 shrink-0" />
                            <p className="text-[15px] font-bold text-zinc-200 truncate">{reservation.client_name}</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center opacity-40 h-full">
                        <div className="w-8 h-1.5 rounded-full bg-white/10 mb-2"></div>
                        <span className="text-xs font-semibold text-zinc-500 tracking-wider uppercase">{t("reservations.roomAvailable") || "EMPTY ROOM"}</span>
                    </div>
                )}
            </div>
        </button>
    );
}
