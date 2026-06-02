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
import QrScannerModal from "@/components/partials/modals/qrscan_modal";
import { LogoutIcon, LockIcon, QrCodeNeonIcon } from "@/components/icons";
import TabBar from "@/components/tab_bar";
import MenuItemCard from "@/components/partials/orders/menu_item_card";

declare global {
    interface Window {
        jsQR?: (
            data: Uint8ClampedArray,
            width: number,
            height: number,
            options?: {
                inversionAttempts?:
                | "dontInvert"
                | "always"
                | "invert"
                | "attemptBoth";
            },
        ) => { data: string } | null;
    }
}

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

    const [activeSession, setActiveSession] = useState<Reservation | null>(null);

    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [itemGroups, setItemGroups] = useState<
        { id: string; name: string }[]
    >([]);
    const [quantities, setQuantities] = useState<Record<string, number>>({});

    const [activeCategory, setActiveCategory] = useState<string>("all");
    const [actionMessage, setActionMessage] = useState<{
        text: string;
        isError?: boolean;
    } | null>(null);

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
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [scanLoading, setScanLoading] = useState(false);
    const [scanStep, setScanStep] = useState<
        "idle" | "scanning" | "error" | "success"
    >("idle");
    const [scanErrorMsg, setScanErrorMsg] = useState("");
    const [forcePasskeySetting, setForcePasskeySetting] = useState(false);
    const [enteredPasskey, setEnteredPasskey] = useState("");
    const enteredPasskeyRef = useRef("");
    useEffect(() => {
        enteredPasskeyRef.current = enteredPasskey;
    }, [enteredPasskey]);
    const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const scanIntervalRef = useRef<number | null>(null);

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
            }
        };
        fetchSettings();
    }, []);

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

    // تحميل مكتبة jsQR ديناميكياً
    useEffect(() => {
        if (typeof window === "undefined" || window.jsQR) return;
        const script = document.createElement("script");
        script.src = "/jsqr.min.js"; // Hosted locally in /public for offline support
        script.async = true;
        document.body.appendChild(script);
        return () => {
            try {
                document.body.removeChild(script);
            } catch { }
        };
    }, []);

    // حلقة مسح الكاميرا بحثاً عن الكود
    function startQrScanningLoop(
        videoElement: HTMLVideoElement,
        stream: MediaStream,
    ) {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        const scan = () => {
            if (
                !isScannerOpen ||
                !videoElement ||
                videoElement.paused ||
                videoElement.ended
            ) {
                scanIntervalRef.current = requestAnimationFrame(scan);
                return;
            }
            if (videoElement.readyState === videoElement.HAVE_ENOUGH_DATA) {
                canvas.width = 320;
                canvas.height = 240;
                context?.drawImage(
                    videoElement,
                    0,
                    0,
                    canvas.width,
                    canvas.height,
                );
                const imageData = context?.getImageData(
                    0,
                    0,
                    canvas.width,
                    canvas.height,
                );

                if (imageData && window.jsQR) {
                    const code = window.jsQR(
                        imageData.data,
                        imageData.width,
                        imageData.height,
                        {
                            inversionAttempts: "dontInvert",
                        },
                    );
                    if (code && code.data) {
                        handleQrDecoded(code.data, stream);
                        return;
                    }
                }
            }
            scanIntervalRef.current = requestAnimationFrame(scan);
        };
        scanIntervalRef.current = requestAnimationFrame(scan);
    }

    function triggerResumeScanning() {
        setTimeout(() => {
            if (isScannerOpen && videoRef.current) {
                setScanStep("scanning");
                setScanErrorMsg("");
                navigator.mediaDevices
                    .getUserMedia({ video: { facingMode: "environment" } })
                    .then((newStream) => {
                        if (videoRef.current) {
                            videoRef.current.srcObject = newStream;
                            videoRef.current.play().catch(() => { });
                            setCameraStream(newStream);
                            startQrScanningLoop(videoRef.current, newStream);
                        }
                    })
                    .catch(() => { });
            }
        }, 3500);
    }

    async function handleQrLogin(
        { roomId, qrCode }: { roomId?: string; qrCode?: string },
        tableName?: string,
        resumeOnFailure: boolean = false,
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
            if (resumeOnFailure) {
                triggerResumeScanning();
            }
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
                    setIsScannerOpen(false);
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
                if (resumeOnFailure) {
                    triggerResumeScanning();
                }
            }
        } catch {
            setScanLoading(false);
            setScanStep("error");
            setScanErrorMsg("Network Error");
            if (resumeOnFailure) {
                triggerResumeScanning();
            }
        }
    }

    function handleQrDecoded(qrData: string, activeStream: MediaStream) {
        if (scanIntervalRef.current) {
            cancelAnimationFrame(scanIntervalRef.current);
            scanIntervalRef.current = null;
        }
        activeStream.getTracks().forEach((track) => track.stop());
        setCameraStream(null);

        handleQrLogin({ qrCode: qrData }, undefined, true);
    }

    // اختيار الغرفة يدوياً من قائمة المودال
    async function handleRoomSelect(roomId: string) {
        const room = availableRooms.find((r) => r.id === roomId);
        await handleQrLogin({ roomId }, room?.name, false);
    }

    // إدارة الكاميرا في المتصفح
    useEffect(() => {
        let activeStream: MediaStream | null = null;
        if (isScannerOpen) {
            const startCamera = async () => {
                try {
                    if (
                        typeof navigator !== "undefined" &&
                        navigator.mediaDevices &&
                        navigator.mediaDevices.getUserMedia
                    ) {
                        const isMobile =
                            /Mobi|Android|iPhone|iPad|iPod|Windows Phone/i.test(
                                navigator.userAgent,
                            ) ||
                            (navigator.maxTouchPoints > 0 &&
                                /Macintosh/i.test(navigator.userAgent));
                        const preferredFacingMode = isMobile
                            ? "environment"
                            : "user";

                        const stream =
                            await navigator.mediaDevices.getUserMedia({
                                video: {
                                    facingMode: preferredFacingMode,
                                    width: { ideal: 640 },
                                    height: { ideal: 480 },
                                },
                            });
                        activeStream = stream;
                        setCameraStream(stream);

                        const videoEl = videoRef.current;
                        if (videoEl) {
                            videoEl.srcObject = stream;
                            videoEl.setAttribute("playsinline", "true");
                            videoEl.setAttribute("muted", "true");
                            await videoEl.play();
                            setScanStep("scanning");
                            startQrScanningLoop(videoEl, stream);
                        }
                    } else {
                        setScanStep("idle");
                        // In production, suppress technical camera/SSL errors — room selection tab handles it
                        if (process.env.NODE_ENV !== "production") {
                            setScanErrorMsg(t("orders.cameraHttpBlock"));
                        }
                    }
                } catch {
                    setScanStep("idle");
                    // In production, suppress technical camera/SSL errors
                    if (process.env.NODE_ENV !== "production") {
                        setScanErrorMsg(t("orders.cameraFailedFallback"));
                    }
                }
            };
            const timer = setTimeout(() => {
                startCamera();
            }, 150);
            return () => {
                clearTimeout(timer);
                if (scanIntervalRef.current)
                    cancelAnimationFrame(scanIntervalRef.current);
                if (activeStream)
                    activeStream.getTracks().forEach((track) => track.stop());
                setCameraStream(null);
            };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isScannerOpen, isRtl]);

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
        try {
            const res = await fetch(
                `${ORDER_USER_API_ROUTE}/${activeSession.room_id}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        reservation_id: activeSession.id,
                        items: [{ id: item.id, quantity: qty }],
                    }),
                },
            );

            if (res.ok) {
                await fetchMenuAndOrders();

                setActionMessage({
                    text: t("orders.itemAddedToTable")
                        .replace("{qty}", qty.toString())
                        .replace("{name}", item.name),
                });
                setQuantities((prev) => ({ ...prev, [item.id]: 1 }));
            } else {
                setActionMessage({
                    text: t("orders.failedToPlaceOrder"),
                    isError: true,
                });
            }
        } catch {
            setActionMessage({ text: "Network error", isError: true });
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
    const totalBill = tableOrders.reduce(
        (sum, o) => sum + o.item_price * o.quantity,
        0,
    );

    const filteredItems = menuItems.filter((item) => {
        if (activeCategory === "all") return true;
        return item.group_id === activeCategory;
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

                            {forcePasskeySetting && (
                                <div className="space-y-2 max-w-xs mx-auto animate-fade-in">
                                    <label
                                        htmlFor="lockPasskeyIn"
                                        className="text-xs font-bold text-zinc-400 block text-center"
                                    >
                                        {t("orders.inputPasskeyLabel")}
                                    </label>
                                    <input
                                        id="lockPasskeyIn"
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        maxLength={6}
                                        value={enteredPasskey}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(
                                                /\D/g,
                                                "",
                                            );
                                            setEnteredPasskey(val);
                                        }}
                                        placeholder={t(
                                            "orders.inputPasskeyPlaceholder",
                                        )}
                                        className="w-full text-center bg-background border border-white/10 text-primary-light font-extrabold tracking-widest rounded-2xl px-4 py-3.5 text-base focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all block"
                                    />
                                </div>
                            )}

                            <div className="pt-2">
                                <PrimaryButton
                                    onClick={() => {
                                        setScanStep("idle");
                                        setScanErrorMsg("");
                                        setIsScannerOpen(true);
                                    }}
                                    className="px-8 py-4 rounded-full bg-primary hover:bg-primary-hover text-background font-extrabold text-sm transition-all duration-200 shadow-xl shadow-primary/10 inline-flex items-center gap-2.5 cursor-pointer"
                                >
                                    <QrCodeNeonIcon className="w-5 h-5" />
                                    <span>{t("orders.btnScan")}</span>
                                </PrimaryButton>
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
                                    <h1 className="text-xl sm:text-2xl font-black text-white">{`${t("orders.welcomeGuestPrefix")} ${activeSession.client_name}`}</h1>
                                    <p className="text-xs text-zinc-400 font-medium">{`${t("orders.assignedLocationPrefix")} (${activeSession.room_name}) — ${t("orders.refNumberPrefix")} ${activeSession.number}`}</p>
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
                                    reservationNumber={activeSession.number}
                                    guestNameLabel={t("orders.guestNameLabel")}
                                    clientName={activeSession.client_name}
                                    tableLocLabel={t("orders.tableLocLabel")}
                                    roomName={activeSession.room_name}
                                    totalOrderedLabel={t(
                                        "orders.totalOrderedLabel",
                                    )}
                                    totalQuantity={tableOrders.reduce(
                                        (sum, o) => sum + o.quantity,
                                        0,
                                    )}
                                    unitUnits={t("orders.unitUnits")}
                                />

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

                {/* QR Scanner Modal */}
                <QrScannerModal
                    isOpen={isScannerOpen}
                    onClose={() => setIsScannerOpen(false)}
                    scanLoading={scanLoading}
                    scanStep={scanStep}
                    scanErrorMsg={scanErrorMsg}
                    cameraStream={cameraStream}
                    videoRef={videoRef}
                    t={t}
                    isRtl={isRtl}
                    forcePasskeySetting={forcePasskeySetting}
                    enteredPasskey={enteredPasskey}
                    onPasskeyChange={setEnteredPasskey}
                    rooms={availableRooms}
                    onRoomSelect={handleRoomSelect}
                />
            </main>
        </>
    );
}
