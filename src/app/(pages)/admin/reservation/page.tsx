"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import AdminHeader from "@/components/headers/admin_header";
import SearchInput from "@/components/SearchInput";
import { useLanguage } from "@/config/i18n";
import { useSettings } from "@/context/settings_context";
import { useReservation } from "@/context/reservation_context";
import { useRoom } from "@/context/room_context";
import { useOrder } from "@/context/order_context";
import { useReport } from "@/context/report_context";
import { useItem } from "@/context/item_context";
import ReservationModel from "@/models/data_models/reservation_model";
import OrderModel from "@/models/data_models/order_model";
import ErrorModal from "@/components/partials/modals/error_modal";
import CombinedReservationModal from "@/components/partials/modals/admin/CombinedReservationModal";
import OrderModal from "@/components/partials/modals/admin/OrderModal";
import { Badge } from "@/components/badge";
import Pagination from "@/components/Pagination";
import TabBar from "@/components/tab_bar";
import Table, { TableColumn } from "@/components/table";
import RoomCard from "@/components/card/room_card";
import { InputField } from "@/components/input";
import { type OrderInput } from "@/lib/validations/order";
export default function ReservationsAdmin() {
    const { t, isRtl } = useLanguage();
    const { settings } = useSettings();
    const {
        reservations,
        total: totalReservations,
        totalPages,
        isReservationsLoading,
        fetchAllReservations,
        addReservation,
        updateReservation,
        acceptReservation,
        activateReservation,
        // checkoutReservation,
        undoReservationAction,
        deleteReservation,
    } = useReservation();
    const { rooms, fetchAllRooms, isRoomsLoading } = useRoom();
    const { orders, fetchAllOrders, updateOrder, deleteOrder, addOrder } = useOrder();
    const { reportsList, fetchAllReports, updateReport } = useReport();
    const { items, fetchAllItems } = useItem();

    const [searchQuery, setSearchQuery] = useState("");
    const [isDateFilterEnabled, setIsDateFilterEnabled] = useState(false);
    const [dateFilter, setDateFilter] = useState(() => new Date().toISOString().split('T')[0]);
    const [roomFilter, setRoomFilter] = useState("");
    const [mainTab, setMainTab] = useState("grid"); // grid | history
    const [currentPage, setCurrentPage] = useState(1);

    // Modal States
    const [isResOpen, setIsResOpen] = useState(false);
    const [editingRes, setEditingRes] = useState<ReservationModel | null>(null);
    const [initialRoomIdForAdd, setInitialRoomIdForAdd] = useState<string>("");
    const [errorModalMsg, setErrorModalMsg] = useState<string | null>(null);
    const [isPageReady, setIsPageReady] = useState(false);

    // Order Modal States
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState<OrderModel | null>(null);

    const perPage = settings?.per_page || 10;

    // Fetch rooms, reports, and orders on mount
    useEffect(() => {
        fetchAllRooms({ fetch_all: "true" });
        fetchAllReports({ fetch_all: "true", per_page: perPage.toString() });
        fetchAllOrders({ fetch_all: "true", per_page: perPage.toString() });
        fetchAllItems({ fetch_all: "true" });
    }, [fetchAllRooms, fetchAllReports, fetchAllOrders, fetchAllItems, perPage]);

    // Fetch reservations depending on tab
    const lastFetchRef = useRef<{ time: number; params: string }>({ time: 0, params: "" });
    const fetchReservations = useCallback(async () => {
        const params = JSON.stringify({ mainTab, currentPage, perPage, searchQuery, dateFilter, isDateFilterEnabled, roomFilter });
        const now = Date.now();
        if (lastFetchRef.current.params === params && now - lastFetchRef.current.time < 500) {
            return;
        }
        lastFetchRef.current = { time: now, params };

        if (mainTab === "grid") {
            // Fetch all active/pending reservations to match with rooms
            await fetchAllReservations({
                fetch_all: "true",
                status: "active_and_pending", // Might need backend support, but usually we just fetch all without pagination for grid or just fetch the active ones
                all: "true"
            });
        } else {
            // Fetch paginated history (completed)
            await fetchAllReservations({
                page: String(currentPage),
                per_page: String(perPage),
                all: "true",
                status: "history",
                search: searchQuery,
                ...(isDateFilterEnabled && dateFilter ? { date: dateFilter } : {}),
                ...(roomFilter ? { room_id: roomFilter } : {})
            });
        }
        setIsPageReady(true);
    }, [mainTab, currentPage, perPage, searchQuery, dateFilter, isDateFilterEnabled, roomFilter, fetchAllReservations]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchReservations();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchReservations]);

    const roomStatuses = useMemo(() => {
        const map = new Map<string, "accepted" | "active" | "pending">();
        reservations
            .filter((r) => !r.completed)
            .forEach((r) => {
                if (r.activated) map.set(r.room_id, "active");
                else if (r.accepted) map.set(r.room_id, "accepted");
                else map.set(r.room_id, "pending");
            });
        return map;
    }, [reservations]);


    const handleOpenEditForm = (res: ReservationModel) => {
        setEditingRes(res);
        setIsResOpen(true);
    };

    const currentReservation = useMemo(() => {
        if (!editingRes) return null;
        return reservations.find(r => r.id === editingRes.id) || editingRes;
    }, [reservations, editingRes]);

    const handleSaveReservation = async (data: { client_name: string; phone: string; room_id: string; date_time: string; }): Promise<boolean> => {
        let success = false;
        if (editingRes) {
            success = await updateReservation(editingRes.id, {
                client_name: data.client_name,
                phone: data.phone,
                room_id: data.room_id,
                date_time: new Date(data.date_time),
            });
        } else {
            success = await addReservation({
                client_name: data.client_name,
                phone: data.phone,
                room_id: data.room_id,
                date_time: new Date(data.date_time),
                accepted: true,
                completed: false,
            });
        }

        if (!success) {
            setErrorModalMsg(t("common.errorOccurred"));
        } else {
            fetchReservations();
        }
        return success;
    };

    // const handleCheckout = async (id: string) => {
    //     const success = await checkoutReservation(id);
    //     if (success) {
    //         fetchReservations();
    //     } else {
    //         setErrorModalMsg(t("orders.msgCheckoutSuccessFailed"));
    //     }
    // };

    const handleAccept = async (id: string) => {
        const success = await acceptReservation(id);
        if (!success) setErrorModalMsg(t("apiMessages.error.roomAlreadyActive"));
        else fetchReservations();
    };

    const handleActivate = async (id: string) => {
        const success = await activateReservation(id);
        if (!success) setErrorModalMsg(t("apiMessages.error.roomAlreadyActive"));
        else fetchReservations();
    };

    const handleComplete = async (id: string) => {
        const success = await updateReservation(id, { completed: true });
        if (!success) setErrorModalMsg(t("common.errorOccurred"));
        else fetchReservations();
    };

    const handleUndoAction = async (id: string, action: "accept" | "activate" | "complete") => {
        const result = await undoReservationAction(id, action);
        if (!result.success) setErrorModalMsg(t(result.error || "common.errorOccurred"));
        else fetchReservations();
    };

    const handleDeleteReservation = async (id: string) => {
        const success = await deleteReservation(id);
        if (!success) setErrorModalMsg(t("apiMessages.error.cannotDeleteActiveReservation"));
        else {
            fetchReservations();
            setIsResOpen(false);
            setEditingRes(null);
        }
    };

    // Orders Actions
    const handleAddOrderClick = () => {
        setEditingOrder(null);
        setIsOrderModalOpen(true);
    };

    const handleEditOrderClick = (order: OrderModel) => {
        setEditingOrder(order);
        setIsOrderModalOpen(true);
    };

    const handleSaveOrder = async (data: OrderInput) => {
        let success = false;
        if (editingOrder) {
            success = await updateOrder(editingOrder.id, data);
        } else {
            success = await addOrder({ ...data, accepted: true });
        }
        if (success) {
            fetchAllOrders();
        } else {
            setErrorModalMsg(t("common.errorOccurred"));
        }
        return success;
    };

    const handleApproveOrder = async (orderId: string) => {
        await updateOrder(orderId, { accepted: true });
        fetchAllOrders();
    };
    const handleUnapproveOrder = async (orderId: string) => {
        await updateOrder(orderId, { accepted: false });
        fetchAllOrders();
    };
    const handleDeleteOrder = async (orderId: string) => {
        await deleteOrder(orderId);
        fetchAllOrders();
    };

    // Reports Actions
    const handleMarkReportRead = async (reportId: string) => {
        await updateReport(reportId, { is_read: true });
        fetchAllReports({ fetch_all: "true", per_page: "1000" });
    };

    const formatDate = (date: Date | string) => {
        const d = new Date(date);
        return d.toLocaleDateString(isRtl ? "ar-SA" : "en-US", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    };

    const historyColumns: TableColumn[] = [
        { key: "client_name", label: t("reservations.columnClient") },
        { key: "phone", label: t("reservations.columnPhone") },
        { key: "date_time", label: t("reservations.columnDateTime") },
        { key: "room", label: t("reservations.columnRoom") },
        { key: "status", label: t("reservations.columnStatus"), align: "center" },
    ];

    return (
        <div className="flex flex-col h-[calc(100vh-96px)] sm:h-[calc(100vh-128px)] space-y-6">
            <AdminHeader
                title={t("reservations.title")}
                subtitle={t("reservations.subtitle")}
            >
                <TabBar
                    tabs={[
                        { id: "grid", label: t("reservations.tabActiveRooms") },
                        { id: "history", label: t("reservations.tabHistory") },
                    ]}
                    activeTab={mainTab}
                    onChange={(id) => { setMainTab(id); setCurrentPage(1); }}
                />
            </AdminHeader>


            {mainTab === "grid" ? (
                // GRID VIEW
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto min-h-0 pb-12">
                    {!isPageReady || isRoomsLoading || isReservationsLoading ? (
                        Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="h-48 rounded-2xl bg-white/5 animate-pulse border border-white/10" />
                        ))
                    ) : (
                        rooms
                            .filter(room => !room.is_disable)
                            .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
                            .map((room) => {
                                const res = reservations.find(r => r.room_id === room.id && !r.completed);

                                // Notifications
                                const roomOrders = res ? orders.filter(o => o.reservation_id === res.id) : [];
                                const unapprovedOrdersCount = roomOrders.filter(o => !o.accepted).length;

                                const roomReports = res ? reportsList.filter(r => r.reservation_id === res.id) : [];
                                const unreadReportsCount = roomReports.filter(r => !r.is_read).length;

                                return (
                                    <RoomCard
                                        key={room.id}
                                        room={room}
                                        reservation={res}
                                        unapprovedOrdersCount={unapprovedOrdersCount}
                                        unreadReportsCount={unreadReportsCount}
                                        onClick={() => {
                                            if (res) handleOpenEditForm(res);
                                            else {
                                                // Open add form with this room pre-selected
                                                setEditingRes(null);
                                                setInitialRoomIdForAdd(room.id);
                                                setIsResOpen(true);
                                            }
                                        }}
                                    />
                                );
                            })
                    )}
                </div>
            ) : (
                // HISTORY VIEW
                <div className="rounded-card border border-white/10 bg-surface p-6 shadow-md flex flex-col flex-1 min-h-0 gap-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="w-full sm:w-72">
                            <SearchInput
                                value={searchQuery}
                                onChange={(v) => { setSearchQuery(v); setCurrentPage(1); }}
                                placeholder={t("reservations.searchRes")}
                            />
                        </div>
                        <div className="w-full sm:w-auto flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-3">
                                <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-zinc-300">
                                    <input
                                        type="checkbox"
                                        checked={isDateFilterEnabled}
                                        onChange={(e) => { setIsDateFilterEnabled(e.target.checked); setCurrentPage(1); }}
                                        className="w-4 h-4 rounded border-white/10 bg-[#0d0f17] text-primary focus:ring-primary/50 cursor-pointer"
                                    />
                                    {t("reservations.filterByDate")}
                                </label>
                                <input
                                    type="date"
                                    value={dateFilter}
                                    disabled={!isDateFilterEnabled}
                                    onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }}
                                    style={{ colorScheme: "dark" }}
                                    className={`w-full sm:w-auto bg-[#0d0f17] border border-white/10 rounded-2xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:border-primary transition-all duration-200 ${!isDateFilterEnabled ? 'opacity-50 cursor-not-allowed text-zinc-500' : 'text-white'} [&::-webkit-calendar-picker-indicator]:invert-[0.8]`}
                                />
                            </div>
                            <div className="w-full sm:w-48">
                                <InputField
                                    isSelect
                                    value={roomFilter}
                                    onChange={(e) => { setRoomFilter(e.target.value); setCurrentPage(1); }}
                                    options={[
                                        { id: "", name: t("reservations.allRooms") },
                                        ...rooms
                                            .filter(room => !room.is_disable)
                                            .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
                                            .map(room => ({ id: room.id, name: room.name }))
                                    ]}
                                />
                            </div>
                        </div>
                    </div>

                    <Table
                        columns={historyColumns}
                        isLoading={isReservationsLoading}
                        dataLength={totalReservations}
                        wrapperClassName="flex-1 min-h-0"
                    >
                        {reservations.map((res: ReservationModel) => (
                            <tr
                                key={res.id}
                                onClick={() => handleOpenEditForm(res)}
                                className="group hover:bg-[#1a1c2c]/40 transition-colors duration-200 cursor-pointer"
                            >
                                <td className={`py-4 px-4 font-bold text-white group-hover:text-primary-light transition-colors whitespace-nowrap ${isRtl ? "text-right" : "text-left"}`}>
                                    {res.client_name}
                                </td>
                                <td className={`py-4 px-4 text-zinc-300 font-bold text-xs whitespace-nowrap ${isRtl ? "text-right" : "text-left"}`}>
                                    {res.phone}
                                </td>
                                <td className={`py-4 px-4 text-zinc-400 text-xs font-semibold whitespace-nowrap ${isRtl ? "text-right" : "text-left"}`}>
                                    {formatDate(res.date_time)}
                                </td>
                                <td className={`py-4 px-4 text-zinc-300 font-bold text-xs whitespace-nowrap ${isRtl ? "text-right" : "text-left"}`}>
                                    {res.room?.name ?? t("common.unknown")}
                                </td>
                                <td className="py-4 px-4 text-center whitespace-nowrap">
                                    <Badge variant="zinc">
                                        {t("reservations.statusCompleted")}
                                    </Badge>
                                </td>
                            </tr>
                        ))}
                    </Table>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalReservations}
                        itemsPerPage={perPage}
                        onPageChange={setCurrentPage}
                    />
                </div>
            )}

            <CombinedReservationModal
                isOpen={isResOpen}
                onClose={() => {
                    setIsResOpen(false);
                    setEditingRes(null);
                    setInitialRoomIdForAdd("");
                }}
                onSave={handleSaveReservation}
                rooms={rooms}
                reservation={currentReservation}
                initialRoomId={initialRoomIdForAdd}
                orders={currentReservation ? orders.filter(o => o.reservation_id === currentReservation.id) : []}
                reports={currentReservation ? reportsList.filter(r => r.reservation_id === currentReservation.id) : []}
                roomStatuses={roomStatuses}
                onAccept={handleAccept}
                onActivate={handleActivate}
                onComplete={handleComplete}
                // onCheckout={handleCheckout}
                onApproveOrder={handleApproveOrder}
                onUnapproveOrder={handleUnapproveOrder}
                onDeleteOrder={handleDeleteOrder}
                onMarkReportRead={handleMarkReportRead}
                onUndoAction={handleUndoAction}
                onDelete={handleDeleteReservation}
                onAddOrderClick={handleAddOrderClick}
                onEditOrderClick={handleEditOrderClick}
            />

            {currentReservation && (
                <OrderModal
                    isOpen={isOrderModalOpen}
                    onClose={() => {
                        setIsOrderModalOpen(false);
                        setEditingOrder(null);
                    }}
                    onSave={handleSaveOrder}
                    order={editingOrder}
                    items={items}
                    reservationId={currentReservation.id}
                />
            )}

            <ErrorModal
                isOpen={!!errorModalMsg}
                onClose={() => setErrorModalMsg(null)}
                message={errorModalMsg}
            />
        </div>
    );
}
