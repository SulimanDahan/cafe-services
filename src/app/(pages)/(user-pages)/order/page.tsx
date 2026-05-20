"use client";
import { ORDER_LOGIN_API_ROUTE, ORDER_USER_API_ROUTE } from "@/config/api_routes";

import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/config/i18n";
import { useSettings } from "@/context/settings_context";
import PWAInstallBanner from "@/components/PWAInstallBanner";
import { PrimaryButton } from "@/components/button/primary_button";
import AdminBlockOverlay from "@/components/partials/orders/admin_block_overlay";
import Billing from "@/components/partials/orders/billing";
import ActiveOrdersList from "@/components/partials/orders/active_orders_list";
import QrScannerModal from "@/components/partials/modals/qrscan_modal";
import { LogoutIcon, LockIcon, QrCodeNeonIcon, PlusIcon } from "@/components/icons";


declare global {
    interface Window {
        jsQR?: (
            data: Uint8ClampedArray,
            width: number,
            height: number,
            options?: {
                inversionAttempts?: "dontInvert" | "always" | "invert" | "attemptBoth";
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
    created_at: string;
}

interface MenuItem {
    id: string;
    name_ar: string;
    name_en: string;
    price: number;
    desc_ar: string;
    desc_en: string;
    category_ar: string;
    category_en: string;
}

const DEFAULT_RESERVATIONS: Reservation[] = [
    {
        id: "res1",
        number: "R-9043",
        client_name: "سليمان دهان",
        phone: "0554321098",
        datetime: "12 مايو 2026 21:00",
        room_id: "rm1",
        room_name: "طاولة VIP 1 (المنطقة الزجاجية)",
        accepted: true,
    },
    {
        id: "res2",
        number: "R-5412",
        client_name: "أحمد العتيبي",
        phone: "0561234567",
        datetime: "13 مايو 2026 19:30",
        room_id: "rm2",
        room_name: "طاولة عائلية 4 (الدور الثاني)",
        accepted: false,
    },
    {
        id: "res3",
        number: "R-3329",
        client_name: "سارة الأحمد",
        phone: "0549876543",
        datetime: "14 مايو 2026 18:00",
        room_id: "rm3",
        room_name: "طاولة ثنائية 2 (شرفة المقهى)",
        accepted: true,
    },
    {
        id: "res4",
        number: "R-1120",
        client_name: "خالد الحربي",
        phone: "0501122334",
        datetime: "15 مايو 2026 20:30",
        room_id: "rm1",
        room_name: "طاولة VIP 1 (المنطقة الزجاجية)",
        accepted: false,
    },
];

const DEFAULT_ORDERS: Order[] = [
    {
        id: "ord-1",
        reservation_id: "res1",
        client_name: "سليمان دهان",
        reservation_number: "R-9043",
        item_id: "i3",
        item_name: "سبانش لاتيه بارد",
        item_price: 22000,
        quantity: 2,
        created_at: "12 مايو 2026 21:10",
    },
    {
        id: "ord-2",
        reservation_id: "res1",
        client_name: "سليمان دهان",
        reservation_number: "R-9043",
        item_id: "i5",
        item_name: "كيكة العسل والزعفران",
        item_price: 28000,
        quantity: 1,
        created_at: "12 مايو 2026 21:15",
    },
    {
        id: "ord-3",
        reservation_id: "res3",
        client_name: "سارة الأحمد",
        reservation_number: "R-3329",
        item_id: "i2",
        item_name: "كابتشينو كلاسيك",
        item_price: 18000,
        quantity: 1,
        created_at: "11 مايو 2026 18:30",
    },
];

const MENU_ITEMS: MenuItem[] = [
    {
        id: "i1",
        name_ar: "إسبريسو مزدوج",
        name_en: "Double Espresso",
        price: 14000,
        desc_ar: "بن كولومبي فاخر مستخلص بعناية مع إيحاءات الكاكاو الغنية دبل شوت",
        desc_en: "Premium Colombian beans carefully extracted with rich cocoa notes, double shot",
        category_ar: "مشروبات ساخنة",
        category_en: "Hot Drinks",
    },
    {
        id: "i2",
        name_ar: "كابتشينو كلاسيك",
        name_en: "Classic Cappuccino",
        price: 18000,
        desc_ar: "إسبريسو غني ممزوج مع حليب مبخر ورغوة حليب كريمية كثيفة ولذيثة",
        desc_en: "Rich espresso combined with steamed milk and a dense, delicious layer of microfoam",
        category_ar: "مشروبات ساخنة",
        category_en: "Hot Drinks",
    },
    {
        id: "i3",
        name_ar: "سبانش لاتيه بارد",
        name_en: "Cold Spanish Latte",
        price: 22000,
        desc_ar: "إسبريسو بارد مع الحليب الطازج والمكثف المحلى يقدم مع مكعبات الثلج",
        desc_en: "Chilled espresso with fresh milk and sweet condensed milk served over ice cubes",
        category_ar: "مشروبات باردة",
        category_en: "Cold Drinks",
    },
    {
        id: "i4",
        name_ar: "كرواسون الزبدة المقرمش",
        name_en: "Crispy Butter Croissant",
        price: 16000,
        desc_ar: "كرواسون فرنسي هش ومورق ومخبوز بالزبدة الطبيعية الفاخرة يقدم دافئاً",
        desc_en: "Flaky golden French layered pastry baked with premium natural butter, served warm",
        category_ar: "مخبوزات",
        category_en: "Pastries",
    },
    {
        id: "i5",
        name_ar: "كيكة العسل والزعفران",
        name_en: "Honey Saffron Cake",
        price: 28000,
        desc_ar: "طبقات كيك العسل الروسية المشربة بكريمة الزعفران الطبيعي العطرة والمميزة",
        desc_en: "Russian honey cake layers soaked with natural aromatic saffron-infused cream",
        category_ar: "حلويات",
        category_en: "Desserts",
    },
];

export default function CustomerOrderPage() {
    const { t, isRtl } = useLanguage();
    const { settings } = useSettings();
    const [isAdminAppBlock, setIsAdminAppBlock] = useState(false);

    // إدارة قواعد البيانات عبر LocalStorage
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [reservations, setReservations] = useState<Reservation[]>(() => {
        if (typeof window === "undefined") return [];
        const storedRes = localStorage.getItem("cafe_reservations");
        if (storedRes) {
            try { return JSON.parse(storedRes); } catch { return DEFAULT_RESERVATIONS; }
        } else {
            localStorage.setItem("cafe_reservations", JSON.stringify(DEFAULT_RESERVATIONS));
            return DEFAULT_RESERVATIONS;
        }
    });

    const [orders, setOrders] = useState<Order[]>(() => {
        if (typeof window === "undefined") return [];
        const storedOrders = localStorage.getItem("cafe_orders");
        if (storedOrders) {
            try { return JSON.parse(storedOrders); } catch { return DEFAULT_ORDERS; }
        } else {
            localStorage.setItem("cafe_orders", JSON.stringify(DEFAULT_ORDERS));
            return DEFAULT_ORDERS;
        }
    });

    const [activeSession, setActiveSession] = useState<Reservation | null>(() => {
        if (typeof window === "undefined") return null;
        const storedSession = sessionStorage.getItem("cafe_active_session");
        if (storedSession) {
            try {
                const sessionObj = JSON.parse(storedSession);
                const storedRes = localStorage.getItem("cafe_reservations");
                let currentRes = DEFAULT_RESERVATIONS;
                if (storedRes) {
                    try { currentRes = JSON.parse(storedRes); } catch { }
                }
                const stillExists = currentRes.find((r) => r.id === sessionObj.id);
                if (stillExists) return sessionObj;
                sessionStorage.removeItem("cafe_active_session");
                return null;
            } catch { return null; }
        }
        return null;
    });

    const [quantities, setQuantities] = useState<Record<string, number>>(() => {
        const initQty: Record<string, number> = {};
        MENU_ITEMS.forEach((item) => { initQty[item.id] = 1; });
        return initQty;
    });

    const [activeCategory, setActiveCategory] = useState<string>("all");
    const [actionMessage, setActionMessage] = useState<{ text: string; isError?: boolean; } | null>(null);

    // حالات الـ QR الكاميرا والمحاكاة
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [scanLoading, setScanLoading] = useState(false);
    const [scanStep, setScanStep] = useState<"idle" | "scanning" | "error" | "success">("idle");
    const [scanErrorMsg, setScanErrorMsg] = useState("");
    const [forcePasskeySetting, setForcePasskeySetting] = useState(false);
    const [enteredPasskey, setEnteredPasskey] = useState("");
    const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const scanIntervalRef = useRef<number | null>(null);

    const [hasMounted, setHasMounted] = useState(false);
    useEffect(() => {
        (() => setHasMounted(true))();
    }, []);

    // تحميل إعدادات النظام للتحقق من رمز المرور
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch("/api/settings");
                if (res.ok) {
                    const result = await res.json();
                    if (result.success && result.data) {
                        setForcePasskeySetting(!!result.data.force_client_order_session_passKey);
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

        const standaloneCheck = window.matchMedia("(display-mode: standalone)").matches ||
            (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

        if (standaloneCheck) {
            const pwaType = sessionStorage.getItem("pwa_type");
            if (pwaType === "admin") {
                setTimeout(() => { setIsAdminAppBlock(true); }, 0);
            } else {
                sessionStorage.setItem("pwa_type", "customer");
            }
        }
    }, []);

    // تحميل مكتبة jsQR ديناميكياً
    useEffect(() => {
        if (typeof window === "undefined" || window.jsQR) return;
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js";
        script.async = true;
        document.body.appendChild(script);
        return () => { try { document.body.removeChild(script); } catch { } };
    }, []);

    // حلقة مسح الكاميرا بحثاً عن الكود
    function startQrScanningLoop(videoElement: HTMLVideoElement, stream: MediaStream) {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        const scan = () => {
            if (!isScannerOpen || !videoElement || videoElement.paused || videoElement.ended) {
                scanIntervalRef.current = requestAnimationFrame(scan);
                return;
            }
            if (videoElement.readyState === videoElement.HAVE_ENOUGH_DATA) {
                canvas.width = 320;
                canvas.height = 240;
                context?.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
                const imageData = context?.getImageData(0, 0, canvas.width, canvas.height);

                if (imageData && window.jsQR) {
                    const code = window.jsQR(imageData.data, imageData.width, imageData.height, {
                        inversionAttempts: "dontInvert",
                    });
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

    function handleQrDecoded(qrData: string, activeStream: MediaStream) {
        if (scanIntervalRef.current) {
            cancelAnimationFrame(scanIntervalRef.current);
            scanIntervalRef.current = null;
        }
        activeStream.getTracks().forEach((track) => track.stop());
        setCameraStream(null);

        const dataLower = qrData.toLowerCase();
        let matchedRoomId = "";
        let matchedTableName = "";

        if (dataLower.includes("vip1") || dataLower.includes("vip 1") || dataLower.includes("rm1") || dataLower.includes("r-9043")) {
            matchedRoomId = "rm1";
            matchedTableName = t("orders.tableVip1");
        } else if (dataLower.includes("table4") || dataLower.includes("table 4") || dataLower.includes("rm2") || dataLower.includes("r-5412")) {
            matchedRoomId = "rm2";
            matchedTableName = t("orders.tableFamily4");
        } else if (dataLower.includes("table2") || dataLower.includes("table 2") || dataLower.includes("rm3") || dataLower.includes("r-3329")) {
            matchedRoomId = "rm3";
            matchedTableName = t("orders.tableDouble2");
        }

        if (matchedRoomId) {
            handleSimulateScan(matchedRoomId, matchedTableName);
        } else {
            setScanStep("error");
            setScanErrorMsg(t("orders.scanQrSuccess").replace("{qrData}", qrData));
            setTimeout(() => {
                if (isScannerOpen && videoRef.current) {
                    setScanStep("scanning");
                    setScanErrorMsg("");
                    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
                        .then((newStream) => {
                            if (videoRef.current) {
                                videoRef.current.srcObject = newStream;
                                videoRef.current.play().catch(() => { });
                                setCameraStream(newStream);
                                startQrScanningLoop(videoRef.current, newStream);
                            }
                        }).catch(() => { });
                }
            }, 3500);
        }
    }

    // إدارة الكاميرا في المتصفح
    useEffect(() => {
        let activeStream: MediaStream | null = null;
        if (isScannerOpen) {
            const startCamera = async () => {
                try {
                    if (typeof navigator !== "undefined" && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                        const isMobile = /Mobi|Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent) ||
                            (navigator.maxTouchPoints > 0 && /Macintosh/i.test(navigator.userAgent));
                        const preferredFacingMode = isMobile ? "environment" : "user";

                        const stream = await navigator.mediaDevices.getUserMedia({
                            video: { facingMode: preferredFacingMode, width: { ideal: 640 }, height: { ideal: 480 } },
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
                        setScanErrorMsg(t("orders.cameraHttpBlock"));
                    }
                } catch {
                    setScanStep("idle");
                    setScanErrorMsg(t("orders.cameraFailedFallback"));
                }
            };
            const timer = setTimeout(() => { startCamera(); }, 150);
            return () => {
                clearTimeout(timer);
                if (scanIntervalRef.current) cancelAnimationFrame(scanIntervalRef.current);
                if (activeStream) activeStream.getTracks().forEach((track) => track.stop());
                setCameraStream(null);
            };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isScannerOpen, isRtl]);

    // المزامنة اللحظية
    useEffect(() => {
        const syncData = () => {
            const storedRes = localStorage.getItem("cafe_reservations");
            const storedOrders = localStorage.getItem("cafe_orders");
            const storedSession = sessionStorage.getItem("cafe_active_session");

            if (storedRes) setReservations(JSON.parse(storedRes));
            if (storedOrders) setOrders(JSON.parse(storedOrders));

            if (storedSession) {
                try {
                    const sObj = JSON.parse(storedSession);
                    const currentResList = storedRes ? JSON.parse(storedRes) : DEFAULT_RESERVATIONS;
                    const stillExists = currentResList.find((r: Reservation) => r.id === sObj.id);
                    if (!stillExists) {
                        setActiveSession(null);
                        sessionStorage.removeItem("cafe_active_session");
                        setActionMessage({
                            text: t("orders.sessionEndedByReception"),
                            isError: false,
                        });
                    } else {
                        setActiveSession(sObj);
                    }
                } catch { setActiveSession(null); }
            } else { setActiveSession(null); }
        };

        window.addEventListener("orders-updated", syncData);
        window.addEventListener("storage", syncData);
        return () => {
            window.removeEventListener("orders-updated", syncData);
            window.removeEventListener("storage", syncData);
        };
    }, [isRtl, t]);

    const updateLocalStorageOrders = (newOrders: Order[]) => {
        setOrders(newOrders);
        localStorage.setItem("cafe_orders", JSON.stringify(newOrders));
    };

    const adjustQuantity = (itemId: string, amount: number) => {
        setQuantities((prev) => {
            const curr = prev[itemId] || 1;
            const updated = curr + amount;
            return { ...prev, [itemId]: updated < 1 ? 1 : updated > 20 ? 20 : updated };
        });
    };

    async function handleSimulateScan(roomId: string, tableName: string) {
        setScanLoading(true);
        setScanStep("scanning");
        setScanErrorMsg("");

        if (forcePasskeySetting && (!enteredPasskey || enteredPasskey.length !== 6)) {
            setScanLoading(false);
            setScanStep("error");
            setScanErrorMsg(isRtl ? "يرجى إدخال رمز التحقق المكون من 6 أرقام أولاً." : "Please enter the 6-digit passkey first.");
            return;
        }

        try {
            const res = await fetch(ORDER_LOGIN_API_ROUTE, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    room_id: roomId,
                    passkey: forcePasskeySetting ? enteredPasskey : undefined
                })
            });

            if (res.ok) {
                const data = await res.json();
                setActiveSession(data.session); // Note: API returns `{ session: activeReservation }`
                sessionStorage.setItem("cafe_active_session", JSON.stringify(data.session));
                setScanStep("success");
                setScanLoading(false);
                setActionMessage({
                    text: t("orders.welcomeSessionUnlocked")
                        .replace("{clientName}", data.session.client_name)
                        .replace("{tableName}", tableName),
                });
                setTimeout(() => { setIsScannerOpen(false); setScanStep("idle"); }, 1200);
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
            }
        } catch {
            setScanLoading(false);
            setScanStep("error");
            setScanErrorMsg("Network Error");
        }
    }

    const handleLogOutSession = () => {
        setActiveSession(null);
        sessionStorage.removeItem("cafe_active_session");
        setActionMessage({ text: t("orders.logoutSession") });
    };

    const handlePlaceOrder = async (item: MenuItem) => {
        if (!activeSession) {
            setActionMessage({ text: t("orders.activateSessionFirst"), isError: true });
            return;
        }

        const qty = quantities[item.id] || 1;
        try {
            const res = await fetch(`${ORDER_USER_API_ROUTE}/${activeSession.room_id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    reservation_id: activeSession.id,
                    items: [{ id: item.id, quantity: qty }]
                })
            });

            if (res.ok) {
                const newOrder: Order = {
                    id: `ord-${Date.now()}`,
                    reservation_id: activeSession.id,
                    client_name: activeSession.client_name,
                    reservation_number: activeSession.number,
                    item_id: item.id,
                    item_name: isRtl ? item.name_ar : item.name_en,
                    item_price: item.price,
                    quantity: qty,
                    created_at: new Date().toLocaleString(isRtl ? "ar-SA" : "en-US", {
                        day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
                    }),
                };

                const updatedOrders = [newOrder, ...orders];
                setOrders(updatedOrders);
                localStorage.setItem("cafe_orders", JSON.stringify(updatedOrders));

                setActionMessage({
                    text: t("orders.itemAddedToTable")
                        .replace("{qty}", qty.toString())
                        .replace("{name}", isRtl ? item.name_ar : item.name_en)
                });
                setQuantities((prev) => ({ ...prev, [item.id]: 1 }));
            } else {
                setActionMessage({ text: t("orders.failedToPlaceOrder"), isError: true });
            }
        } catch {
            setActionMessage({ text: "Network error", isError: true });
        }
    };

    const handleCancelOrder = (orderId: string, itemName: string) => {
        updateLocalStorageOrders(orders.filter((o) => o.id !== orderId));
        setActionMessage({ text: t("orders.cancelledSuccessfully").replace("{name}", itemName), isError: true });
        window.dispatchEvent(new CustomEvent("orders-updated"));
    };

    useEffect(() => {
        if (actionMessage) {
            const timer = setTimeout(() => setActionMessage(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [actionMessage]);

    const tableOrders = activeSession ? orders.filter((o) => o.reservation_id === activeSession.id) : [];
    const totalBill = tableOrders.reduce((sum, o) => sum + o.item_price * o.quantity, 0);

    const categories = ["all", "m_saq", "m_bar", "makh", "halw"];
    const getCategoryLabel = (cat: string) => {
        switch (cat) {
            case "all": return t("orders.catAll");
            case "m_saq": return t("orders.catHot");
            case "m_bar": return t("orders.catCold");
            case "makh": return t("orders.catPastry");
            case "halw": return t("orders.catDessert");
            default: return cat;
        }
    };

    const filteredItems = MENU_ITEMS.filter((item) => {
        if (activeCategory === "all") return true;
        if (activeCategory === "m_saq") return item.category_en === "Hot Drinks";
        if (activeCategory === "m_bar") return item.category_en === "Cold Drinks";
        if (activeCategory === "makh") return item.category_en === "Pastries";
        if (activeCategory === "halw") return item.category_en === "Desserts";
        return true;
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
                @keyframes laser-sweep { 0%, 100% { top: 0%; opacity: 0.8; } 50% { top: 100%; opacity: 1; } }
                .animate-laser { animation: laser-sweep 2s infinite ease-in-out; }
            `}</style>

            {actionMessage && (
                <div className="fixed bottom-6 left-6 right-6 sm:left-auto sm:max-w-md z-50 animate-bounce">
                    <div className={`rounded-2xl border px-5 py-4 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-4 ${actionMessage.isError ? "bg-red-500/10 border-red-500/30 text-red-300" : "bg-amber-500/10 border-amber-500/30 text-amber-300"}`}>
                        <div className="flex items-center gap-3">
                            <span className={`h-6 w-6 rounded-lg flex items-center justify-center font-extrabold text-xs border ${actionMessage.isError ? "bg-red-500/20 border-red-500/30" : "bg-amber-500/20 border-amber-500/30"}`}>
                                {actionMessage.isError ? "✕" : "✓"}
                            </span>
                            <p className="text-xs font-black leading-relaxed">{actionMessage.text}</p>
                        </div>
                        <button onClick={() => setActionMessage(null)} className="text-zinc-400 hover:text-white text-sm font-black">✕</button>
                    </div>
                </div>
            )}

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 md:px-8 py-14 flex flex-col items-center justify-center relative">
                {!activeSession ? (
                    <>
                        <div className="absolute w-80 h-80 rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />
                        <div className="max-w-xl w-full rounded-[28px] border border-white/10 bg-[#131522]/40 p-8 sm:p-10 shadow-2xl text-center space-y-6 relative overflow-hidden backdrop-blur-sm">
                            <div className="mx-auto h-20 w-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shadow-lg relative group">
                                <div className="absolute inset-0 rounded-3xl border border-amber-500/30 animate-ping opacity-25" />
                                <LockIcon className="animate-pulse w-10 h-10" />
                            </div>
                            <div className="space-y-3">
                                <h1 className="text-xl sm:text-2xl font-black text-white">{t("orders.step1Title")}</h1>
                                <p className="text-xs text-zinc-400 font-medium leading-relaxed max-w-md mx-auto">{t("orders.step1Sub")}</p>
                            </div>
                            <div className="pt-2">
                                <PrimaryButton
                                    onClick={() => { setScanStep("idle"); setScanErrorMsg(""); setEnteredPasskey(""); setIsScannerOpen(true); }}
                                    className="px-8 py-4 rounded-full bg-amber-500 hover:bg-amber-400 text-[#07080a] font-extrabold text-sm transition-all duration-200 active:scale-95 shadow-xl shadow-amber-500/10 inline-flex items-center gap-2.5 cursor-pointer"
                                >
                                    <QrCodeNeonIcon className="text-black w-5 h-5 bg-black" />
                                    <span>{t("orders.btnScan")}</span>
                                </PrimaryButton>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="w-full rounded-[28px] border border-green-500/30 bg-[#131522]/60 p-6 sm:p-8 shadow-2xl relative overflow-hidden mb-6">
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
                                    className="px-5 py-2.5 rounded-full border border-red-500/20 bg-red-500/5 hover:bg-red-500 hover:text-white text-red-400 font-extrabold text-xs transition-all active:scale-95 flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0"
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
                                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                                        {t("orders.cateringMenuTitle")}
                                    </h2>
                                    <div className="flex flex-wrap gap-1.5">
                                        {categories.map((cat) => (
                                            <PrimaryButton
                                                key={cat}
                                                onClick={() => setActiveCategory(cat)}
                                                className={`px-3.5! py-1.5! rounded-full text-[10px] font-black transition-all active:scale-95 ${activeCategory === cat ? "bg-amber-500 text-black font-extrabold shadow-lg shadow-amber-500/10" : "bg-white/5 text-zinc-400 hover:text-white border border-white/5"}`}
                                            >
                                                {getCategoryLabel(cat)}
                                            </PrimaryButton>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {filteredItems.map((item) => {
                                        const qty = quantities[item.id] || 1;
                                        return (
                                            <div key={item.id} className="rounded-3xl border border-white/10 bg-[#131522] p-5.5 hover:border-amber-500/30 transition-all duration-300 flex flex-col justify-between gap-4 group shadow-md">
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-start gap-2">
                                                        <span className="px-2.5 py-1 rounded-full text-[9px] font-black bg-[#0d0f17] text-amber-400/90 border border-white/5">{isRtl ? item.category_ar : item.category_en}</span>
                                                        <span className="text-xs font-black text-amber-400">{item.price.toLocaleString("en-US")} {t(`common.${settings.currency_name}`)}</span>
                                                    </div>
                                                    <h3 className="text-sm font-black text-white group-hover:text-amber-300 transition-colors">{isRtl ? item.name_ar : item.name_en}</h3>
                                                    <p className="text-xs text-zinc-400 leading-relaxed font-medium">{isRtl ? item.desc_ar : item.desc_en}</p>
                                                </div>
                                                <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-3">
                                                    <div className="flex items-center bg-[#0d0f17] border border-white/10 rounded-full p-0.5 shrink-0">
                                                        <button type="button" onClick={() => adjustQuantity(item.id, -1)} className="h-7 w-7 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/5 font-extrabold transition-all">-</button>
                                                        <span className="w-8 text-center text-xs font-black text-white">{qty}</span>
                                                        <button type="button" onClick={() => adjustQuantity(item.id, 1)} className="h-7 w-7 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/5 font-extrabold transition-all">+</button>
                                                    </div>
                                                    <button onClick={() => handlePlaceOrder(item)} className="flex-1 py-2.5 px-4 rounded-full bg-amber-500 hover:bg-amber-400 text-[#07080a] font-black text-xs transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 shadow-md flex items-center justify-center gap-1.5 cursor-pointer">
                                                        <PlusIcon className="w-3.5 h-3.5" />
                                                        <span>{t("orders.btnAddOrder")}</span>
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* الفاتورة والطلبات النشطة */}
                            <div className="lg:col-span-4 space-y-6">
                                <Billing
                                    basketTotalLabel={t("orders.basketTotal")}
                                    totalBill={totalBill}
                                    currencyLabel={t(`common.${settings.currency_name}`)}
                                    bookingIdLabel={t("orders.bookingIdLabel")}
                                    reservationNumber={activeSession.number}
                                    guestNameLabel={t("orders.guestNameLabel")}
                                    clientName={activeSession.client_name}
                                    tableLocLabel={t("orders.tableLocLabel")}
                                    roomName={activeSession.room_name}
                                    totalOrderedLabel={t("orders.totalOrderedLabel")}
                                    totalQuantity={tableOrders.reduce((sum, o) => sum + o.quantity, 0)}
                                    unitUnits={t("orders.unitUnits")}
                                />

                                <ActiveOrdersList
                                    title={t("orders.myActiveOrders")}
                                    orders={tableOrders}
                                    currencyLabel={t(`common.${settings.currency_name}`)}
                                    noItemsLabel={t("orders.noItemsOrderedYet")}
                                    btnCancelTitle={t("orders.btnCancelOrder")}
                                    onCancelOrder={handleCancelOrder}
                                />
                            </div>
                        </div>
                    </>
                )}

                {/* استدعاء الـ Modal المفصول هنا */}
                <QrScannerModal
                    isOpen={isScannerOpen}
                    onClose={() => setIsScannerOpen(false)}
                    scanLoading={scanLoading}
                    scanStep={scanStep}
                    scanErrorMsg={scanErrorMsg}
                    cameraStream={cameraStream}
                    videoRef={videoRef}
                    onSimulateScan={handleSimulateScan}
                    t={t}
                    isRtl={isRtl}
                    forcePasskeySetting={forcePasskeySetting}
                    enteredPasskey={enteredPasskey}
                    onPasskeyChange={setEnteredPasskey}
                />
            </main>
        </>
    );
}