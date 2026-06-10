"use client";
import {
    ORDER_LOGIN_API_ROUTE,
    ORDER_USER_API_ROUTE,
    ORDER_SESSION_API_ROUTE,
    ORDER_LOGOUT_API_ROUTE,
    ROOMS_USER_API_ROUTE,
} from "@/config/api_routes";
import { useState, useEffect, useRef, useCallback } from "react";
import { useLanguage } from "@/config/i18n";
import { useSettings } from "@/context/settings_context";
import PWAInstallBanner from "@/components/PWAInstallBanner";
import { PrimaryButton } from "@/components/button/primary_button";
import AdminBlockOverlay from "@/components/partials/orders/admin_block_overlay";
import Billing from "@/components/partials/orders/billing";
import ActiveOrdersList from "@/components/partials/orders/active_orders_list";
import { LogoutIcon, LockIcon } from "@/components/icons";
import TabBar from "@/components/tab_bar";
import MenuItemCard from "@/components/partials/orders/menu_item_card";
import { InputField } from "@/components/input";
import { playCustomerChime } from "@/lib/audio";

interface Reservation {
    id: string;
    number: string;
    client_name: string;
    phone: string;
    datetime: string;
    room_id: string;
    room_name: string;
    accepted: boolean;
    session_expires_at?: string;
}

interface Order {
    id: string;
    reservation_id: string;
    client_name: string;
    reservation_number: string;
    item_id: string;
    item_name: string;
    item_price: number;
    quantity: number;
    accepted: boolean;
    created_at: string;
}

interface MenuItem {
    id: string;
    name: string;
    price: number | string;
    group_id: string;
    group: {
        id: string;
        name: string;
    };
}

interface ApiOrder {
    id: string;
    reservation_id: string;
    item_id: string;
    item_price: number | string;
    quantity: number;
    accepted: boolean;
    created_at: string;
    item?: {
        name: string;
    };
}
// Dynamic items are loaded from database

export default function CustomerOrderPage() {
    const { t, isRtl } = useLanguage();
    const { settings } = useSettings();
    const [isAdminAppBlock, setIsAdminAppBlock] = useState(false);

    const [orders, setOrders] = useState<Order[]>([]);
    const [cartItems, setCartItems] = useState<{ item: MenuItem; quantity: number; notes?: string }[]>([]);
    const [isConfirming, setIsConfirming] = useState(false);

    const [activeSession, setActiveSession] = useState<Reservation | null>(null);

    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [itemGroups, setItemGroups] = useState<
        { id: string; name: string }[]
    >([]);
    const [quantities, setQuantities] = useState<Record<string, number>>({});
    const [notes, setNotes] = useState<Record<string, string>>({});

    const [activeCategory, setActiveCategory] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [actionMessage, setActionMessage] = useState<{
        text: string;
        isError?: boolean;
    } | null>(null);

    const previousOrdersRef = useRef<Order[]>([]);


    useEffect(() => {
        const prevOrders = previousOrdersRef.current;
        if (prevOrders.length > 0 && orders.length > 0) {
            // Find if any order changed from !accepted to accepted
            const newlyAccepted = orders.some((currentOrder) => {
                if (!currentOrder.accepted) return false;
                const prevOrder = prevOrders.find((o) => o.id === currentOrder.id);
                // If it existed before and was NOT accepted, but is now accepted
                return prevOrder && !prevOrder.accepted;
            });

            if (newlyAccepted) {
                playCustomerChime();
                setActionMessage({
                    text: t("orders.orderAcceptedSuccess") || "Your order has been approved!",
                    isError: false,
                });
            }
        }
        previousOrdersRef.current = orders;
    }, [orders, t]);

    // Load dynamic menu items, groups, and active orders from database
    const fetchMenuAndOrders = useCallback(async () => {
        if (!activeSession) return;
        try {
            // Fetch menu items and groups
            const menuRes = await fetch("/api/order/items");
            if (menuRes.ok) {
                const data = await menuRes.json();
                setMenuItems(data.items || []);
                setItemGroups(data.groups || []);
            }

            // Fetch active orders for this reservation session
            const ordersRes = await fetch(
                `${ORDER_USER_API_ROUTE}/${activeSession.room_id}?reservation_id=${activeSession.id}`,
            );
            if (ordersRes.ok) {
                const data = await ordersRes.json();
                if (data.success && data.orders) {
                    const mappedOrders: Order[] = data.orders.map(
                        (o: ApiOrder) => ({
                            id: o.id,
                            reservation_id: o.reservation_id,
                            client_name: activeSession.client_name,
                            reservation_number: String(activeSession.number),
                            item_id: o.item_id,
                            item_name: o.item?.name || "",
                            item_price: Number(o.item_price),
                            quantity: o.quantity,
                            accepted: o.accepted,
                            created_at: new Date(o.created_at).toLocaleString(
                                isRtl ? "ar-SA" : "en-US",
                                {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                },
                            ),
                        }),
                    );
                    setOrders(mappedOrders);
                }
            } else if (ordersRes.status === 403) {
                const data = await ordersRes.json();
                if (data.sessionExpired) {
                    setActiveSession(null);
                    // Clear the server-side HttpOnly cookie
                    fetch(ORDER_LOGOUT_API_ROUTE, { method: "POST" }).catch(() => null);
                    setActionMessage({
                        text: t("orders.sessionEndedByReception"),
                        isError: false,
                    });
                }
            }
        } catch (err) {
            console.error("Failed to fetch menu or orders:", err);
        }
    }, [activeSession, isRtl, t]);

    // حالات الـ QR الكاميرا والمحاكاة
    const [scanLoading, setScanLoading] = useState(false);
    const [scanStep, setScanStep] = useState<
        "idle" | "scanning" | "error" | "success"
    >("idle");
    const [scanErrorMsg, setScanErrorMsg] = useState("");
    const [forcePasskeySetting, setForcePasskeySetting] = useState(false);
    const [settingsLoaded, setSettingsLoaded] = useState(false);
    const [enteredPasskey, setEnteredPasskey] = useState("");
    const enteredPasskeyRef = useRef("");

    const [urlQrCode, setUrlQrCode] = useState<string | null>(null);
    const [selectedRoomId, setSelectedRoomId] = useState("");

    useEffect(() => {
        enteredPasskeyRef.current = enteredPasskey;
    }, [enteredPasskey]);
    const [hasMounted, setHasMounted] = useState(false);
    useEffect(() => {
        (() => setHasMounted(true))();
    }, []);

    // جلب قائمة الغرف العامة (للاختيار اليدوي في المودال)
    const [availableRooms, setAvailableRooms] = useState<
        { id: string; name: string }[]
    >([]);
    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const res = await fetch(
                    `${ROOMS_USER_API_ROUTE}?t=${Date.now()}`,
                    { cache: "no-store" },
                );
                if (res.ok) {
                    const data = await res.json();
                    const list = Array.isArray(data)
                        ? data
                        : Array.isArray(data.data)
                            ? data.data
                            : [];
                    setAvailableRooms(list);
                }
            } catch {
                // silent — modal room tab will just show empty
            }
        };
        fetchRooms();
    }, []);

    // استرداد الجلسة من الـ Cookie عند تحميل الصفحة
    useEffect(() => {
        const restoreSession = async () => {
            try {
                const res = await fetch(ORDER_SESSION_API_ROUTE, { cache: "no-store" });
                if (res.ok) {
                    const data = await res.json();
                    if (data.session) {
                        setActiveSession(data.session);
                    }
                }
            } catch {
                // silent — no session to restore
            }
        };
        restoreSession();
    }, []);

    // تحميل إعدادات النظام للتحقق من رمز المرور
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch("/api/settings");
                if (res.ok) {
                    const result = await res.json();
                    if (result.success && result.data) {
                        setForcePasskeySetting(
                            !!result.data.force_client_order_session_passKey,
                        );
                    }
                }
            } catch (err) {
                console.error("Failed to fetch settings:", err);
            } finally {
                setSettingsLoaded(true);
            }
        };
        fetchSettings();
    }, []);

    // استخراج رمز QR من الرابط (URL)
    useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const qr = params.get("qr");
            if (qr) {
                (() => setUrlQrCode(qr))();
            }
        }
    }, []);

    // محاولة تسجيل الدخول التلقائي من الرابط الذكي
    useEffect(() => {
        if (
            settingsLoaded &&
            urlQrCode &&
            !activeSession &&
            scanStep === "idle" &&
            !scanLoading
        ) {
            if (forcePasskeySetting) {
                // Wait for user to input passkey in the main form
            } else {
                handleQrLogin({ qrCode: urlQrCode });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [settingsLoaded, urlQrCode, forcePasskeySetting, activeSession]);

    // البيئة وعزل الـ PWA
    useEffect(() => {
        if (typeof window === "undefined") return;

        const standaloneCheck =
            window.matchMedia("(display-mode: standalone)").matches ||
            (window.navigator as Navigator & { standalone?: boolean })
                .standalone === true;

        if (standaloneCheck) {
            const pwaType = sessionStorage.getItem("pwa_type");
            if (pwaType === "admin") {
                setTimeout(() => {
                    setIsAdminAppBlock(true);
                }, 0);
            } else {
                sessionStorage.setItem("pwa_type", "customer");
            }
        }
    }, []);

    async function handleQrLogin(
        { roomId, qrCode }: { roomId?: string; qrCode?: string },
        tableName?: string,
    ) {
        setScanLoading(true);
        setScanStep("scanning");
        setScanErrorMsg("");

        const isPasskeyRequired = forcePasskeySetting;
        const currentPasskey = enteredPasskeyRef.current;
        if (
            isPasskeyRequired &&
            (!currentPasskey || currentPasskey.length !== 6)
        ) {
            setScanLoading(false);
            setScanStep("error");
            setScanErrorMsg(t("orders.errPasskeyRequired"));
            return;
        }

        try {
            const res = await fetch(ORDER_LOGIN_API_ROUTE, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    room_id: roomId,
                    qr_code: qrCode,
                    passkey: forcePasskeySetting ? currentPasskey : undefined,
                }),
            });

            if (res.ok) {
                const data = await res.json();

                // Map room_name if it is not present but room object is
                const sessionData = {
                    ...data.session,
                    room_name:
                        data.session.room_name ||
                        data.session.room?.name ||
                        tableName ||
                        "",
                };

                setActiveSession(sessionData);
                setScanStep("success");
                setScanLoading(false);
                setActionMessage({
                    text: t("orders.welcomeSessionUnlocked")
                        .replace("{clientName}", sessionData.client_name)
                        .replace("{tableName}", sessionData.room_name),
                });
                setTimeout(() => {
                    setScanStep("idle");
                }, 1200);
            } else {
                let errMsg = t("orders.noActiveConfirmedReservation");
                try {
                    const errData = await res.json();
                    if (errData && errData.error) {
                        errMsg = errData.error;
                    }
                } catch { }
                setScanLoading(false);
                setScanStep("error");
                setScanErrorMsg(errMsg);

                // If it was a passkey error (status 422), do nothing extra since form is on page
                if (res.status === 422) {
                    return;
                }
            }
        } catch {
            setScanLoading(false);
            setScanStep("error");
            setScanErrorMsg("Network Error");
        }
    }

    // المزامنة اللحظية مع قاعدة البيانات
    useEffect(() => {
        if (!activeSession) return;

        // Check if the client session has expired by time
        if (activeSession.session_expires_at) {
            const expiresAt = new Date(activeSession.session_expires_at).getTime();
            const now = Date.now();
            if (now >= expiresAt) {
                (() => setActiveSession(null))();
                // Cookie cleared server-side by /api/order/logout
                fetch(ORDER_LOGOUT_API_ROUTE, { method: "POST" }).catch(() => null);
                (() => setActionMessage({
                    text: t("orders.sessionEndedByReception"),
                    isError: false,
                }))();
                return;
            }
        }

        const handleSync = () => {
            // Re-check expiry on each sync
            if (activeSession.session_expires_at) {
                const expiresAt = new Date(activeSession.session_expires_at).getTime();
                if (Date.now() >= expiresAt) {
                    setActiveSession(null);
                    // Cookie cleared server-side by /api/order/logout
                    fetch(ORDER_LOGOUT_API_ROUTE, { method: "POST" }).catch(() => null);
                    setActionMessage({
                        text: t("orders.sessionEndedByReception"),
                        isError: false,
                    });
                    return;
                }
            }
            fetchMenuAndOrders();
        };

        // Defer initial fetch to avoid synchronous setState cascading render warning
        const timer = setTimeout(handleSync, 0);

        window.addEventListener("orders-updated", handleSync);
        window.addEventListener("storage", handleSync);

        const interval = setInterval(handleSync, 10000); // تحديث كل 10 ثوانٍ

        return () => {
            clearTimeout(timer);
            window.removeEventListener("orders-updated", handleSync);
            window.removeEventListener("storage", handleSync);
            clearInterval(interval);
        };
    }, [activeSession, fetchMenuAndOrders, t]);

    const adjustQuantity = (itemId: string, amount: number) => {
        setQuantities((prev) => {
            const curr = prev[itemId] || 1;
            const updated = curr + amount;
            return {
                ...prev,
                [itemId]: updated < 1 ? 1 : updated > 20 ? 20 : updated,
            };
        });
    };

    const handleLogOutSession = async () => {
        setActiveSession(null);
        // Clear the server-side HttpOnly cookie
        await fetch(ORDER_LOGOUT_API_ROUTE, { method: "POST" }).catch(() => null);
        setActionMessage({ text: t("orders.logoutSession") });
    };

    const handlePlaceOrder = async (item: MenuItem) => {
        if (!activeSession) {
            setActionMessage({
                text: t("orders.activateSessionFirst"),
                isError: true,
            });
            return;
        }

        const qty = quantities[item.id] || 1;
        const itemNote = notes[item.id] || "";

        setCartItems(prev => {
            const existing = prev.find(c => c.item.id === item.id && c.notes === itemNote);
            if (existing) {
                return prev.map(c => (c.item.id === item.id && c.notes === itemNote) ? { ...c, quantity: c.quantity + qty } : c);
            }
            return [...prev, { item, quantity: qty, notes: itemNote }];
        });

        setActionMessage({
            text: t("orders.itemAddedToTable")
                .replace("{qty}", qty.toString())
                .replace("{name}", item.name),
        });
        setQuantities((prev) => ({ ...prev, [item.id]: 1 }));
        setNotes((prev) => ({ ...prev, [item.id]: "" }));
    };

    const handleRemoveFromCart = (itemId: string, itemNotes?: string) => {
        setCartItems(prev => prev.filter(c => !(c.item.id === itemId && c.notes === itemNotes)));
    };

    const handleConfirmOrders = async () => {
        if (!activeSession || cartItems.length === 0) return;
        setIsConfirming(true);

        try {
            const res = await fetch(
                `${ORDER_USER_API_ROUTE}/${activeSession.room_id}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        reservation_id: activeSession.id,
                        items: cartItems.map(c => ({ id: c.item.id, quantity: c.quantity, notes: c.notes })),
                    }),
                },
            );

            if (res.ok) {
                await fetchMenuAndOrders();
                setCartItems([]);
                setActionMessage({
                    text: t("orders.itemAddedToTable")
                        .replace("{qty}", cartItems.reduce((sum, c) => sum + c.quantity, 0).toString())
                        .replace("{name}", t("orders.pendingCart") || "Items"),
                });
            } else {
                setActionMessage({
                    text: t("orders.failedToPlaceOrder"),
                    isError: true,
                });
            }
        } catch {
            setActionMessage({ text: "Network error", isError: true });
        } finally {
            setIsConfirming(false);
        }
    };

    const handleCancelOrder = async (orderId: string, itemName: string) => {
        if (!activeSession) return;
        try {
            const res = await fetch(
                `${ORDER_USER_API_ROUTE}/${activeSession.room_id}?order_id=${orderId}&reservation_id=${activeSession.id}`,
                {
                    method: "DELETE",
                },
            );

            if (res.ok) {
                await fetchMenuAndOrders();
                setActionMessage({
                    text: t("orders.cancelledSuccessfully").replace(
                        "{name}",
                        itemName,
                    ),
                    isError: true,
                });
            } else {
                setActionMessage({
                    text: t("orders.errCancelOrder"),
                    isError: true,
                });
            }
        } catch (err) {
            console.error("Failed to cancel order:", err);
            setActionMessage({ text: "Network error", isError: true });
        }
    };

    useEffect(() => {
        if (actionMessage) {
            const timer = setTimeout(() => setActionMessage(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [actionMessage]);

    const tableOrders = activeSession
        ? orders.filter((o) => o.reservation_id === activeSession.id)
        : [];

    // Combine saved active orders with local cart items to show the full potential bill
    const totalSavedBill = tableOrders.reduce(
        (sum, o) => sum + o.item_price * o.quantity,
        0,
    );
    const totalCartBill = cartItems.reduce(
        (sum, c) => sum + Number(c.item.price) * c.quantity,
        0
    );
    const totalBill = totalSavedBill + totalCartBill;

    const filteredItems = menuItems.filter((item) => {
        const matchesCategory = activeCategory === "all" || item.group_id === activeCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    if (isAdminAppBlock) {
        return (
            <AdminBlockOverlay
                title={t("orders.adminAppTitle")}
                description={t("orders.adminAppDesc")}
                buttonText={t("orders.returnAdmin")}
                isRtl={isRtl}
            />
        );
    }

    if (!hasMounted) return null;

    return (
        <>
            <PWAInstallBanner appType="customer" />

            <style jsx global>{`
                @keyframes laser-sweep {
                    0%,
                    100% {
                        top: 0%;
                        opacity: 0.8;
                    }
                    50% {
                        top: 100%;
                        opacity: 1;
                    }
                }
                .animate-laser {
                    animation: laser-sweep 2s infinite ease-in-out;
                }
            `}</style>

            {actionMessage && (
                <div className="fixed bottom-6 left-6 right-6 sm:left-auto sm:max-w-md z-50 animate-bounce">
                    <div
                        className={`rounded-2xl border px-5 py-4 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-4 ${actionMessage.isError ? "bg-red-500/10 border-red-500/30 text-red-300" : "bg-primary/10 border-primary/30 text-primary-light"}`}
                    >
                        <div className="flex items-center gap-3">
                            <span
                                className={`h-6 w-6 rounded-lg flex items-center justify-center font-extrabold text-xs border ${actionMessage.isError ? "bg-red-500/20 border-red-500/30" : "bg-primary/20 border-primary/30"}`}
                            >
                                {actionMessage.isError ? "✕" : "✓"}
                            </span>
                            <p className="text-xs font-black leading-relaxed">
                                {actionMessage.text}
                            </p>
                        </div>
                        <button
                            onClick={() => setActionMessage(null)}
                            className="text-zinc-400 hover:text-white text-sm font-black"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}



            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 md:px-8 py-14 flex flex-col items-center justify-center relative">
                {!activeSession ? (
                    <>
                        <div className="absolute w-80 h-80 rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
                        <div className="max-w-xl w-full rounded-card border border-white/10 bg-surface/40 p-8 sm:p-10 shadow-2xl text-center space-y-6 relative overflow-hidden backdrop-blur-sm">
                            <div className="mx-auto h-20 w-20 rounded-3xl bg-primary/10 border border-primary/20 text-primary-hover flex items-center justify-center shadow-lg relative group">
                                <div className="absolute inset-0 rounded-3xl border border-primary/30 animate-ping opacity-25" />
                                <LockIcon className="animate-pulse w-10 h-10" />
                            </div>
                            <div className="space-y-3">
                                <h1 className="text-xl sm:text-2xl font-black text-white">
                                    {t("orders.step1Title")}
                                </h1>
                                <p className="text-xs text-zinc-400 font-medium leading-relaxed max-w-md mx-auto">
                                    {t("orders.step1Sub")}
                                </p>
                            </div>

                            <div className="space-y-4 pt-4 w-full max-w-sm mx-auto">
                                {!urlQrCode && (
                                    <div className="space-y-2 animate-fade-in text-start">
                                        <InputField
                                            id="mainRoomSelectDropdown"
                                            label={t("orders.selectRoomLabel")}
                                            isSelect
                                            options={[
                                                { id: "", name: t("orders.selectRoomPlaceholder") },
                                                ...availableRooms,
                                            ]}
                                            value={selectedRoomId}
                                            onChange={(e) => {
                                                setSelectedRoomId((e as React.ChangeEvent<HTMLSelectElement>).target.value);
                                                setScanErrorMsg("");
                                            }}
                                            disabled={scanLoading}
                                        />
                                    </div>
                                )}

                                {forcePasskeySetting && (
                                    <div className="space-y-2 animate-fade-in text-start">
                                        <label
                                            htmlFor="lockPasskeyInMain"
                                            className="text-xs font-bold text-zinc-400 block"
                                        >
                                            {t("orders.inputPasskeyLabel")}
                                        </label>
                                        <input
                                            id="lockPasskeyInMain"
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            maxLength={6}
                                            value={enteredPasskey}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                                                setEnteredPasskey(val);
                                            }}
                                            placeholder={t("orders.inputPasskeyPlaceholder")}
                                            className="w-full text-center text-3xl font-black tracking-[0.5em] bg-surface-container border border-white/10 rounded-xl py-3 text-white focus:outline-hidden focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-zinc-600 placeholder:text-xl placeholder:tracking-normal"
                                            disabled={scanLoading}
                                            autoComplete="off"
                                        />
                                    </div>
                                )}

                                {scanStep === "error" && scanErrorMsg && (
                                    <p className="text-[10px] text-red-400 font-medium text-center mt-2 bg-red-500/10 py-2 rounded-lg border border-red-500/20">
                                        {scanErrorMsg}
                                    </p>
                                )}

                                <div className="pt-2">
                                    <PrimaryButton
                                        onClick={async () => {
                                            if (urlQrCode) {
                                                await handleQrLogin({ qrCode: urlQrCode });
                                            } else if (selectedRoomId) {
                                                const room = availableRooms.find((r) => r.id === selectedRoomId);
                                                await handleQrLogin({ roomId: selectedRoomId }, room?.name);
                                            }
                                        }}
                                        disabled={scanLoading || (!urlQrCode && !selectedRoomId) || (forcePasskeySetting && enteredPasskey.length !== 6)}
                                        className="w-full relative group overflow-hidden justify-center"
                                        size="lg"
                                    >
                                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                        <span className="relative flex items-center justify-center gap-2 font-extrabold tracking-wide">
                                            {scanLoading ? (
                                                <div className="flex items-center justify-center gap-2">
                                                    <div className="animate-spin h-4 w-4 border-2 border-white/50 border-t-white rounded-full" />
                                                    <span>{t("common.loading")}</span>
                                                </div>
                                            ) : (
                                                <>
                                                    <LockIcon className="w-5 h-5" />
                                                    {t("orders.btnUnlockRoom")}
                                                </>
                                            )}
                                        </span>
                                    </PrimaryButton>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="w-full rounded-card border border-green-500/30 bg-surface/60 p-6 sm:p-8 shadow-2xl relative overflow-hidden mb-6">
                            <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-green-500/5 blur-[120px] pointer-events-none" />
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                                <div className="space-y-1.5">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black bg-green-500/10 border border-green-500/25 text-green-400 shadow-sm uppercase">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                        {t("orders.bookingVerified")}
                                    </span>
                                    <h1 className="text-xl sm:text-2xl font-black text-white">{`${t("orders.welcomeGuestPrefix")} ${activeSession!.client_name}`}</h1>
                                    <p className="text-xs text-zinc-400 font-medium">{`${t("orders.assignedLocationPrefix")} (${activeSession!.room_name}) — ${t("orders.refNumberPrefix")} ${activeSession!.number}`}</p>
                                </div>
                                <PrimaryButton
                                    onClick={handleLogOutSession}
                                    className="px-5 py-2.5 rounded-full border border-red-500/20 bg-red-500/5 hover:bg-red-500 hover:text-white text-red-400 font-extrabold text-xs transition-all flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0"
                                >
                                    <LogoutIcon />
                                    <span>{t("orders.endSession")}</span>
                                </PrimaryButton>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in w-full">
                            {/* قائمة المشروبات والمأكولات */}
                            <div className="lg:col-span-8 space-y-6">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-1">
                                    <h2 className="text-lg font-black text-white flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                                        {t("orders.cateringMenuTitle")}
                                    </h2>
                                    <TabBar
                                        tabs={[
                                            {
                                                id: "all",
                                                label: t("orders.catAll"),
                                            },
                                            ...itemGroups.map((group) => ({
                                                id: group.id,
                                                label: group.name,
                                            })),
                                        ]}
                                        activeTab={activeCategory}
                                        onChange={setActiveCategory}
                                    />
                                </div>

                                <div className="animate-fade-in relative">
                                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                        <span className="text-zinc-500 font-bold text-lg">⌕</span>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder={t("common.search") || "ابحث عن صنف..."}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-surface-container border border-white/10 rounded-2xl py-3 pr-10 pl-4 text-white placeholder-zinc-500 focus:outline-hidden focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-sm font-bold"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                                    {filteredItems.map((item) => (
                                        <MenuItemCard
                                            key={item.id}
                                            item={item}
                                            quantity={quantities[item.id] || 1}
                                            onAdjustQuantity={(amount) =>
                                                adjustQuantity(item.id, amount)
                                            }
                                            onPlaceOrder={() =>
                                                handlePlaceOrder(item)
                                            }
                                            currencyLabel={t(
                                                `common.${settings.currency_name}`,
                                            )}
                                            addOrderLabel={t(
                                                "orders.btnAddOrder",
                                            )}
                                            note={notes[item.id] || ""}
                                            onChangeNote={(val) => setNotes(prev => ({ ...prev, [item.id]: val }))}
                                            notePlaceholder={t("orders.notePlaceholder") || "أضف ملاحظة (اختياري)..."}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* الفاتورة والطلبات النشطة */}
                            <div className="lg:col-span-4 space-y-6">
                                <Billing
                                    basketTotalLabel={t("orders.basketTotal")}
                                    totalBill={totalBill}
                                    currencyLabel={t(
                                        `common.${settings.currency_name}`,
                                    )}
                                    bookingIdLabel={t("orders.bookingIdLabel")}
                                    reservationNumber={activeSession!.number}
                                    guestNameLabel={t("orders.guestNameLabel")}
                                    clientName={activeSession!.client_name}
                                    tableLocLabel={t("orders.tableLocLabel")}
                                    roomName={activeSession!.room_name}
                                    totalOrderedLabel={t(
                                        "orders.totalOrderedLabel",
                                    )}
                                    totalQuantity={tableOrders.reduce(
                                        (sum, o) => sum + o.quantity,
                                        0,
                                    ) + cartItems.reduce((sum, c) => sum + c.quantity, 0)}
                                    unitUnits={t("orders.unitUnits")}
                                />

                                {/* سلة الطلبات غير المؤكدة */}
                                {cartItems.length > 0 && (
                                    <div className="rounded-card border border-primary/30 bg-primary/5 p-6 shadow-xl space-y-4 animate-fade-in relative overflow-hidden">
                                        <div className="absolute inset-0 bg-linear-to-b from-primary/10 to-transparent pointer-events-none opacity-50" />

                                        <div className="flex items-center gap-2 relative z-10">
                                            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                                            <h3 className="text-sm font-black text-white">{t("orders.pendingCart") || "سلة الطلبات المؤقتة"}</h3>
                                        </div>

                                        <div className="space-y-3 relative z-10 max-h-60 overflow-y-auto pr-1">
                                            {cartItems.map((cartItem, idx) => (
                                                <div key={`${cartItem.item.id}-${idx}`} className="flex justify-between items-center bg-[#131522] border border-white/5 p-3 rounded-2xl">
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="text-sm font-bold text-white">{cartItem.item.name}</span>
                                                        <span className="text-xs font-medium text-amber-500">
                                                            {cartItem.quantity} x {Number(cartItem.item.price)} {t(`common.${settings.currency_name}`)}
                                                        </span>
                                                        {cartItem.notes && (
                                                            <span className="text-[10px] text-zinc-400 mt-1">{t("orders.notePrefix") || "ملاحظة: "}{cartItem.notes}</span>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemoveFromCart(cartItem.item.id, cartItem.notes)}
                                                        className="h-8 w-8 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500/20 transition-colors"
                                                    >
                                                        <span className="text-xs font-bold">✕</span>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="pt-2 relative z-10">
                                            <PrimaryButton
                                                onClick={handleConfirmOrders}
                                                disabled={isConfirming}
                                                className="w-full justify-center group"
                                            >
                                                <span className="font-extrabold tracking-wide">
                                                    {isConfirming ? t("common.loading") : (t("orders.confirmSend") || "تأكيد وإرسال الطلبات")}
                                                </span>
                                            </PrimaryButton>
                                        </div>
                                    </div>
                                )}

                                <ActiveOrdersList
                                    title={t("orders.myActiveOrders")}
                                    orders={tableOrders}
                                    currencyLabel={t(
                                        `common.${settings.currency_name}`,
                                    )}
                                    noItemsLabel={t("orders.noItemsOrderedYet")}
                                    btnCancelTitle={t("orders.btnCancelOrder")}
                                    onCancelOrder={handleCancelOrder}
                                />
                            </div>
                        </div>
                    </>
                )}
            </main>
        </>
    );
}
