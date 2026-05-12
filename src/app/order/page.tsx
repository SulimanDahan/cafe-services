"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useLanguage } from "@/config/i18n";

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

// Interfaces
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
	createdAt: string;
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

// Pre-seeded defaults
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
		createdAt: "12 مايو 2026 21:10",
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
		createdAt: "12 مايو 2026 21:15",
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
		createdAt: "11 مايو 2026 18:30",
	},
];

const MENU_ITEMS: MenuItem[] = [
	{
		id: "i1",
		name_ar: "إسبريسو مزدوج",
		name_en: "Double Espresso",
		price: 14000,
		desc_ar:
			"بن كولومبي فاخر مستخلص بعناية مع إيحاءات الكاكاو الغنية دبل شوت",
		desc_en:
			"Premium Colombian beans carefully extracted with rich cocoa notes, double shot",
		category_ar: "مشروبات ساخنة",
		category_en: "Hot Drinks",
	},
	{
		id: "i2",
		name_ar: "كابتشينو كلاسيك",
		name_en: "Classic Cappuccino",
		price: 18000,
		desc_ar:
			"إسبريسو غني ممزوج مع حليب مبخر ورغوة حليب كريمية كثيفة ولذيذة",
		desc_en:
			"Rich espresso combined with steamed milk and a dense, delicious layer of microfoam",
		category_ar: "مشروبات ساخنة",
		category_en: "Hot Drinks",
	},
	{
		id: "i3",
		name_ar: "سبانش لاتيه بارد",
		name_en: "Cold Spanish Latte",
		price: 22000,
		desc_ar:
			"إسبريسو بارد مع الحليب الطازج والمكثف المحلى يقدم مع مكعبات الثلج",
		desc_en:
			"Chilled espresso with fresh milk and sweet condensed milk served over ice cubes",
		category_ar: "مشروبات باردة",
		category_en: "Cold Drinks",
	},
	{
		id: "i4",
		name_ar: "كرواسون الزبدة المقرمش",
		name_en: "Crispy Butter Croissant",
		price: 16000,
		desc_ar:
			"كرواسون فرنسي هش ومورق ومخبوز بالزبدة الطبيعية الفاخرة يقدم دافئاً",
		desc_en:
			"Flaky golden French layered pastry baked with premium natural butter, served warm",
		category_ar: "مخبوزات",
		category_en: "Pastries",
	},
	{
		id: "i5",
		name_ar: "كيكة العسل والزعفران",
		name_en: "Honey Saffron Cake",
		price: 28000,
		desc_ar:
			"طبقات كيك العسل الروسية المشربة بكريمة الزعفران الطبيعي العطرة والمميزة",
		desc_en:
			"Russian honey cake layers soaked with natural aromatic saffron-infused cream",
		category_ar: "حلويات",
		category_en: "Desserts",
	},
];

export default function CustomerOrderPage() {
	const { t, isRtl, locale, setLocale } = useLanguage();

	// Unified localStorage databases
	const [reservations, setReservations] = useState<Reservation[]>(() => {
		if (typeof window === "undefined") return [];
		const storedRes = localStorage.getItem("cafe_reservations");
		if (storedRes) {
			try {
				return JSON.parse(storedRes);
			} catch {
				return DEFAULT_RESERVATIONS;
			}
		} else {
			localStorage.setItem(
				"cafe_reservations",
				JSON.stringify(DEFAULT_RESERVATIONS),
			);
			return DEFAULT_RESERVATIONS;
		}
	});

	const [orders, setOrders] = useState<Order[]>(() => {
		if (typeof window === "undefined") return [];
		const storedOrders = localStorage.getItem("cafe_orders");
		if (storedOrders) {
			try {
				return JSON.parse(storedOrders);
			} catch {
				return DEFAULT_ORDERS;
			}
		} else {
			localStorage.setItem("cafe_orders", JSON.stringify(DEFAULT_ORDERS));
			return DEFAULT_ORDERS;
		}
	});

	// Session states
	const [activeSession, setActiveSession] = useState<Reservation | null>(
		() => {
			if (typeof window === "undefined") return null;
			const storedSession = localStorage.getItem("cafe_active_session");
			if (storedSession) {
				try {
					const sessionObj = JSON.parse(storedSession);
					// Double check if this session's reservation is still present
					const storedRes = localStorage.getItem("cafe_reservations");
					let currentRes = DEFAULT_RESERVATIONS;
					if (storedRes) {
						try {
							currentRes = JSON.parse(storedRes);
						} catch {}
					}
					const stillExists = currentRes.find(
						(r) => r.id === sessionObj.id,
					);
					if (stillExists) {
						return sessionObj;
					} else {
						localStorage.removeItem("cafe_active_session");
						return null;
					}
				} catch {
					return null;
				}
			}
			return null;
		},
	);

	// Interactive component states
	const [quantities, setQuantities] = useState<Record<string, number>>(() => {
		const initQty: Record<string, number> = {};
		MENU_ITEMS.forEach((item) => {
			initQty[item.id] = 1;
		});
		return initQty;
	});

	const [activeCategory, setActiveCategory] = useState<string>("all");
	const [actionMessage, setActionMessage] = useState<{
		text: string;
		isError?: boolean;
	} | null>(null);

	// QR Scanner Simulator & Camera States
	const [isScannerOpen, setIsScannerOpen] = useState(false);
	const [scanLoading, setScanLoading] = useState(false);
	const [scanStep, setScanStep] = useState<
		"idle" | "scanning" | "error" | "success"
	>("idle");
	const [scanErrorMsg, setScanErrorMsg] = useState("");
	const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

	// Persistent video and scan loop refs
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const scanIntervalRef = useRef<number | null>(null);

	// Load jsQR library dynamically on client side
	useEffect(() => {
		if (typeof window === "undefined") return;
		if (window.jsQR) return;

		const script = document.createElement("script");
		script.src = "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js";
		script.async = true;
		script.onload = () => {
			console.log("jsQR library loaded successfully.");
		};
		script.onerror = () => {
			console.error("Failed to load jsQR library from CDN.");
		};
		document.body.appendChild(script);

		return () => {
			try {
				document.body.removeChild(script);
			} catch {}
		};
	}, []);

	// Real-time canvas-based QR scanning loop
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
						console.log(
							"Successfully Decoded QR Content:",
							code.data,
						);
						handleQrDecoded(code.data, stream);
						return; // Exit loop on success
					}
				}
			}
			scanIntervalRef.current = requestAnimationFrame(scan);
		};

		scanIntervalRef.current = requestAnimationFrame(scan);
	}

	// Parse physical QR code string content and match with pre-seeded data
	function handleQrDecoded(qrData: string, activeStream: MediaStream) {
		if (scanIntervalRef.current) {
			cancelAnimationFrame(scanIntervalRef.current);
			scanIntervalRef.current = null;
		}

		// Close physical camera tracks
		activeStream.getTracks().forEach((track) => track.stop());
		setCameraStream(null);

		const dataLower = qrData.toLowerCase();
		let matchedRoomId = "";
		let matchedTableName = "";

		// Dynamic keyword parsing
		if (
			dataLower.includes("vip1") ||
			dataLower.includes("vip 1") ||
			dataLower.includes("rm1") ||
			dataLower.includes("r-9043")
		) {
			matchedRoomId = "rm1";
			matchedTableName = "VIP 1";
		} else if (
			dataLower.includes("table4") ||
			dataLower.includes("table 4") ||
			dataLower.includes("rm2") ||
			dataLower.includes("r-5412")
		) {
			matchedRoomId = "rm2";
			matchedTableName = isRtl ? "طاولة عائلية 4" : "Family Table 4";
		} else if (
			dataLower.includes("table2") ||
			dataLower.includes("table 2") ||
			dataLower.includes("rm3") ||
			dataLower.includes("r-3329")
		) {
			matchedRoomId = "rm3";
			matchedTableName = isRtl ? "طاولة ثنائية 2" : "Double Table 2";
		}

		if (matchedRoomId) {
			handleSimulateScan(matchedRoomId, matchedTableName);
		} else {
			setScanStep("error");
			setScanErrorMsg(
				isRtl
					? `تمت قراءة كود QR بنجاح: (${qrData}) ولكن الرمز لا يرتبط بأي طاولة مسجلة في نظامنا.`
					: `Scanned code successfully: (${qrData}) but it does not match any table registered in our systems.`,
			);

			// Retry scanning loop after 3.5 seconds
			setTimeout(() => {
				if (isScannerOpen && videoRef.current) {
					setScanStep("scanning");
					setScanErrorMsg("");
					// Re-open camera stream
					navigator.mediaDevices
						.getUserMedia({ video: { facingMode: "environment" } })
						.then((newStream) => {
							if (videoRef.current) {
								videoRef.current.srcObject = newStream;
								videoRef.current.play().catch(() => {});
								setCameraStream(newStream);
								startQrScanningLoop(
									videoRef.current,
									newStream,
								);
							}
						})
						.catch(() => {});
				}
			}, 3500);
		}
	}

	// Handle browser hardware camera lifecycle inside the scanner modal
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

							// Start the real-time QR decoding loop
							setScanStep("scanning");
							startQrScanningLoop(videoEl, stream);
						}
					} else {
						setScanStep("idle");
						setScanErrorMsg(
							isRtl
								? "ملاحظة: المتصفح يمنع الكاميرا في الأوضاع غير الآمنة (HTTP). يمكنك استخدام محاكاة المسح الضوئي الذكي أدناه بكل سلاسة."
								: "Note: Insecure context (HTTP) blocks camera access in this browser. Please use the simulated scan cards below.",
						);
					}
				} catch (err) {
					console.warn(
						"Camera access failed or user rejected permission.",
						err,
					);
					setScanStep("idle");
					setScanErrorMsg(
						isRtl
							? "ملاحظة: لفتح الكاميرا الحقيقية يرجى منح صلاحيات الكاميرا وتشغيل الموقع ببروتوكول آمن (HTTPS). تم تفعيل نظام محاكاة الاستقبال كبديل تشغيلي."
							: "Note: To access the live camera, please allow permissions and run in a secure context (HTTPS). Fallback prototype mode active.",
					);
				}
			};

			// Defer camera initialization to allow modal DOM elements to render instantly
			const timer = setTimeout(() => {
				startCamera();
			}, 150);

			return () => {
				clearTimeout(timer);
				if (scanIntervalRef.current) {
					cancelAnimationFrame(scanIntervalRef.current);
					scanIntervalRef.current = null;
				}
				if (activeStream) {
					activeStream.getTracks().forEach((track) => track.stop());
				}
				setCameraStream(null);
			};
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isScannerOpen, isRtl]);

	// Handle external database refreshes (updates from admin dashboard checkout)
	useEffect(() => {
		const syncData = () => {
			const storedRes = localStorage.getItem("cafe_reservations");
			const storedOrders = localStorage.getItem("cafe_orders");
			const storedSession = localStorage.getItem("cafe_active_session");

			if (storedRes) setReservations(JSON.parse(storedRes));
			if (storedOrders) setOrders(JSON.parse(storedOrders));

			if (storedSession) {
				try {
					const sObj = JSON.parse(storedSession);
					const currentResList = storedRes
						? JSON.parse(storedRes)
						: DEFAULT_RESERVATIONS;
					const stillExists = currentResList.find(
						(r: Reservation) => r.id === sObj.id,
					);
					if (!stillExists) {
						// Admin checked us out! Lock screen.
						setActiveSession(null);
						localStorage.removeItem("cafe_active_session");
						setActionMessage({
							text: isRtl
								? "تم إنهاء الحجز من قبل الاستقبال وتصفية الحساب. شكراً لزيارتك!"
								: "Reservation ended by reception. Thank you for your visit!",
							isError: false,
						});
					} else {
						setActiveSession(sObj);
					}
				} catch (e) {
					console.error("Error checking sync session", e);
				}
			} else {
				setActiveSession(null);
			}
		};

		window.addEventListener("orders-updated", syncData);
		window.addEventListener("storage", syncData);

		return () => {
			window.removeEventListener("orders-updated", syncData);
			window.removeEventListener("storage", syncData);
		};
	}, [isRtl]);

	// Update localStorage helper
	const updateLocalStorageOrders = (newOrders: Order[]) => {
		setOrders(newOrders);
		localStorage.setItem("cafe_orders", JSON.stringify(newOrders));
	};

	// Counter modifier
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

	// Scan Table QR Trigger Simulator
	function handleSimulateScan(roomId: string, tableName: string) {
		setScanLoading(true);
		setScanStep("scanning");
		setScanErrorMsg("");

		// Simulate 1.2 seconds decoding and security checks
		setTimeout(() => {
			// Find reservations for this room
			const roomReservations = reservations.filter(
				(r) => r.room_id === roomId,
			);

			// Today's date token
			const todayAr = "12 مايو 2026";
			const todayEn = "May 12, 2026";

			// Filter if has accepted reservation for today
			const todayActiveRes = roomReservations.find(
				(r) =>
					r.accepted &&
					(r.datetime.includes(todayAr) ||
						r.datetime.includes(todayEn)),
			);

			if (todayActiveRes) {
				// Unlock session
				setActiveSession(todayActiveRes);
				localStorage.setItem(
					"cafe_active_session",
					JSON.stringify(todayActiveRes),
				);
				setScanStep("success");
				setScanLoading(false);

				setActionMessage({
					text: isRtl
						? `أهلاً بك عميلنا المميز (${todayActiveRes.client_name})! تم فتح جلسة الطلب لطاولة ${tableName} بنجاح.`
						: `Welcome guest (${todayActiveRes.client_name})! Order session for Table ${tableName} unlocked successfully.`,
				});

				// Wait a moment then close scanner modal
				setTimeout(() => {
					setIsScannerOpen(false);
					setScanStep("idle");
				}, 1200);
			} else {
				// Failed check! No active confirmed reservation for today
				setScanLoading(false);
				setScanStep("error");

				// Find if there is any reservation at all to provide clear contextual feedback
				const anyRes = roomReservations[0];
				if (anyRes) {
					if (!anyRes.accepted) {
						setScanErrorMsg(
							isRtl
								? `عذراً! الحجز الموجود باسم (${anyRes.client_name}) لم يتم تأكيده وقبوله من الإدارة بعد.`
								: `Sorry! The reservation under (${anyRes.client_name}) is still pending confirmation from management.`,
						);
					} else {
						setScanErrorMsg(
							isRtl
								? `عذراً! لا يوجد حجز مؤكد ومقبول لتاريخ اليوم (${todayAr}) على هذه الطاولة. (تاريخ حجز الطاولة الفعلي المعتمد هو: ${anyRes.datetime.split(" ")[0]} ${anyRes.datetime.split(" ")[1]})`
								: `Sorry! No confirmed reservation for today (${todayEn}) exists on this table. (Actual booking date is: ${anyRes.datetime})`,
						);
					}
				} else {
					setScanErrorMsg(
						isRtl
							? `عذراً! لا توجد أي حجوزات مسجلة على طاولة ${tableName} في نظامنا. يرجى التوجه للاستقبال للحجز.`
							: `Sorry! No reservations registered under Table ${tableName} in our systems. Please check in with reception.`,
					);
				}
			}
		}, 1200);
	}

	// Log out session (locks screen)
	const handleLogOutSession = () => {
		setActiveSession(null);
		localStorage.removeItem("cafe_active_session");
		setActionMessage({
			text: isRtl
				? "تم تسجيل الخروج وقفل الجلسة بنجاح."
				: "Logged out and locked order session successfully.",
		});
	};

	// Order placement
	const handlePlaceOrder = (item: MenuItem) => {
		if (!activeSession) {
			setActionMessage({
				text: isRtl
					? "يجب تفعيل الجلسة ومسح الـ QR أولاً"
					: "You must scan a QR code and activate a session first",
				isError: true,
			});
			return;
		}

		const qty = quantities[item.id] || 1;
		const orderCounter = Date.now();

		const newOrder: Order = {
			id: `ord-${orderCounter}`,
			reservation_id: activeSession.id,
			client_name: activeSession.client_name,
			reservation_number: activeSession.number,
			item_id: item.id,
			item_name: isRtl ? item.name_ar : item.name_en,
			item_price: item.price,
			quantity: qty,
			createdAt: new Date().toLocaleString(isRtl ? "ar-SA" : "en-US", {
				day: "numeric",
				month: "long",
				year: "numeric",
				hour: "2-digit",
				minute: "2-digit",
			}),
		};

		const updatedOrders = [newOrder, ...orders];
		updateLocalStorageOrders(updatedOrders);

		setActionMessage({
			text: isRtl
				? `تم إضافة طلب (${qty} × ${item.name_ar}) لطاولتك بنجاح!`
				: `Successfully added (${qty} × ${item.name_en}) to your table!`,
		});

		window.dispatchEvent(new CustomEvent("orders-updated"));
		setQuantities((prev) => ({ ...prev, [item.id]: 1 }));
	};

	// Cancel/Remove order
	const handleCancelOrder = (orderId: string, itemName: string) => {
		const updated = orders.filter((o) => o.id !== orderId);
		updateLocalStorageOrders(updated);

		setActionMessage({
			text: isRtl
				? `تم إلغاء طلب (${itemName}) بنجاح.`
				: `Successfully cancelled order for (${itemName}).`,
			isError: true,
		});

		window.dispatchEvent(new CustomEvent("orders-updated"));
	};

	// Trigger dismiss
	useEffect(() => {
		if (actionMessage) {
			const timer = setTimeout(() => {
				setActionMessage(null);
			}, 4000);
			return () => clearTimeout(timer);
		}
	}, [actionMessage]);

	// Filter parameters based on active table orders
	const tableOrders = activeSession
		? orders.filter((o) => o.reservation_id === activeSession.id)
		: [];
	const totalBill = tableOrders.reduce(
		(sum, o) => sum + o.item_price * o.quantity,
		0,
	);

	const categories = ["all", "m_saq", "m_bar", "makh", "halw"];
	const getCategoryLabel = (cat: string) => {
		switch (cat) {
			case "all":
				return isRtl ? "الكل" : "All";
			case "m_saq":
				return isRtl ? "مشروبات ساخنة" : "Hot Drinks";
			case "m_bar":
				return isRtl ? "مشروبات باردة" : "Cold Drinks";
			case "makh":
				return isRtl ? "مخبوزات" : "Pastries";
			case "halw":
				return isRtl ? "حلويات" : "Desserts";
			default:
				return cat;
		}
	};

	const filteredItems = MENU_ITEMS.filter((item) => {
		if (activeCategory === "all") return true;
		if (activeCategory === "m_saq")
			return item.category_en === "Hot Drinks";
		if (activeCategory === "m_bar")
			return item.category_en === "Cold Drinks";
		if (activeCategory === "makh") return item.category_en === "Pastries";
		if (activeCategory === "halw") return item.category_en === "Desserts";
		return true;
	});

	return (
		<div
			className="min-h-screen bg-[#07080a] text-zinc-100 font-sans flex flex-col selection:bg-amber-500 selection:text-black overflow-x-hidden"
			dir={isRtl ? "rtl" : "ltr"}
		>
			{/* Custom laser line scan animations styling injection */}
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

			{/* High-Contrast Glassmorphic AppBar */}
			<header className="sticky top-4 z-40 max-w-7xl w-[calc(100%-2rem)] mx-auto rounded-3xl border border-white/10 bg-[#0d0f17]/90 backdrop-blur-xl shadow-2xl transition-all duration-300">
				<div className="px-6 h-16 flex items-center justify-between">
					<div className="flex items-center gap-6">
						{/* Logo */}
						<div className="h-9.5 w-9.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center font-black text-lg shadow-lg">
							<svg
								className="w-5.5 h-5.5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2.5"
									d="M12 3v1m0 16v1m9-9h-1M4 12H3"
								/>
							</svg>
						</div>
						<span className="text-sm sm:text-base md:text-lg font-black tracking-wide text-white whitespace-nowrap hidden sm:inline">
							{t("home.title")}
						</span>

						{/* Customer Navbar menu links */}
						<nav className="flex items-center gap-1 sm:gap-2">
							<Link
								href="/"
								className="px-3 py-1.5 rounded-full text-xs font-bold text-zinc-400 hover:text-white transition-all active:scale-95"
							>
								{isRtl ? "الرئيسية" : "Home"}
							</Link>
							<Link
								href="/order"
								className="px-4 py-1.5 rounded-full text-xs font-black bg-amber-500/10 text-amber-300 border border-amber-500/30 shadow-md active:scale-95"
							>
								{isRtl ? "طلب أصناف" : "Order Items"}
							</Link>
						</nav>
					</div>

					{/* Language toggle and active guest status header */}
					<div className="flex items-center gap-3">
						{activeSession && (
							<div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-black uppercase">
								<span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
								<span>
									{isRtl
										? `طاولة نشطة: ${activeSession.room_name.split(" ")[0]}`
										: `Active Table: ${activeSession.room_name.split(" ")[0]}`}
								</span>
							</div>
						)}

						<button
							onClick={() =>
								setLocale(locale === "ar" ? "en" : "ar")
							}
							className="px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-amber-500/30 text-xs font-black text-zinc-200 transition-all duration-200 flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
						>
							<svg
								className="w-4 h-4 text-amber-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2.2"
									d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2h1.5a3 3 0 013 3V16.5m-1.5-12.1a9 9 0 012.3 12.3"
								/>
							</svg>
							<span className="hidden sm:inline">
								{locale === "ar" ? "English" : "العربية"}
							</span>
							<span className="sm:hidden font-extrabold uppercase">
								{locale === "ar" ? "EN" : "AR"}
							</span>
						</button>
					</div>
				</div>
			</header>

			{/* Toast feedback alerts */}
			{actionMessage && (
				<div className="fixed bottom-6 left-6 right-6 sm:left-auto sm:max-w-md z-50 animate-bounce">
					<div
						className={`rounded-2xl border px-5 py-4 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-4 ${
							actionMessage.isError
								? "bg-red-500/10 border-red-500/30 text-red-300"
								: "bg-amber-500/10 border-amber-500/30 text-amber-300"
						}`}
					>
						<div className="flex items-center gap-3">
							<span
								className={`h-6 w-6 rounded-lg flex items-center justify-center font-extrabold text-xs border ${
									actionMessage.isError
										? "bg-red-500/20 border-red-500/30"
										: "bg-amber-500/20 border-amber-500/30"
								}`}
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

			{/* CASE A: NO ACTIVE SESSION - SHOW PREMIUM LOCK SCREEN */}
			{!activeSession ? (
				<main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 md:px-8 py-14 flex flex-col items-center justify-center relative">
					{/* Background Glowing blobs */}
					<div className="absolute w-80 h-80 rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />

					<div className="max-w-xl w-full rounded-[28px] border border-white/10 bg-[#131522]/40 p-8 sm:p-10 shadow-2xl text-center space-y-6 relative overflow-hidden backdrop-blur-sm">
						{/* Double lock/shield emblem */}
						<div className="mx-auto h-20 w-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shadow-lg relative group">
							{/* Pulse circle outline */}
							<div className="absolute inset-0 rounded-3xl border border-amber-500/30 animate-ping opacity-25" />
							<svg
								className="w-10 h-10 animate-pulse"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
								/>
							</svg>
						</div>

						<div className="space-y-3">
							<h1 className="text-xl sm:text-2xl font-black text-white">
								{isRtl
									? "بوابة الخدمة الذاتية وحماية الطاولات"
									: "Table Access Security Gateway"}
							</h1>
							<p className="text-xs text-zinc-400 font-medium leading-relaxed max-w-md mx-auto">
								{isRtl
									? "للبدء بطلب أصناف الضيافة الفاخرة على طاولتك، يرجى التكرم بمسح رمز الـ QR الملصق على الطاولة والتأكد من وجود حجز مؤكد ومفعل باسمك لتاريخ اليوم."
									: "To begin ordering premium refreshments directly to your table, please scan the QR code sticker located on your table and verify your confirmed booking for today."}
							</p>
						</div>

						{/* Locker Action trigger */}
						<div className="pt-2">
							<button
								onClick={() => {
									setScanStep("idle");
									setScanErrorMsg("");
									setIsScannerOpen(true);
								}}
								className="px-8 py-4 rounded-full bg-amber-500 hover:bg-amber-400 text-[#07080a] font-extrabold text-sm transition-all duration-200 active:scale-95 shadow-xl shadow-amber-500/10 inline-flex items-center gap-2.5 cursor-pointer"
							>
								{/* QR icon */}
								<svg
									className="w-5 h-5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2.5"
										d="M12 4v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"
									/>
								</svg>
								<span>
									{isRtl
										? "مسح رمز الـ QR للطاولة"
										: "Scan Table QR Code"}
								</span>
							</button>
						</div>
					</div>
				</main>
			) : (
				/* CASE B: ACTIVE SESSION VERIFIED - UNLOCK PORTAL MENU */
				<main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 md:px-8 py-10 flex flex-col gap-8">
					{/* Active Session Info strip banner */}
					<div className="rounded-[28px] border border-green-500/30 bg-[#131522]/60 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
						<div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-green-500/5 blur-[120px] pointer-events-none" />

						<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
							<div className="space-y-1.5">
								<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black bg-green-500/10 border border-green-500/25 text-green-400 shadow-sm uppercase">
									<span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
									{isRtl
										? "تم التحقق ومطابقة الحجز بنجاح"
										: "Booking Verified & Secure Session Active"}
								</span>
								<h1 className="text-xl sm:text-2xl font-black text-white">
									{isRtl
										? `أهلاً بك، عميلنا المميز: ${activeSession.client_name}`
										: `Welcome back, guest: ${activeSession.client_name}`}
								</h1>
								<p className="text-xs text-zinc-400 font-medium">
									{isRtl
										? `طاولة الحجز الخاصة بك: (${activeSession.room_name}) — رقم الحجز المرجعي: ${activeSession.number}`
										: `Your Assigned Location: (${activeSession.room_name}) — Reference Number: ${activeSession.number}`}
								</p>
							</div>

							{/* Exit Session trigger */}
							<button
								onClick={handleLogOutSession}
								className="px-5 py-2.5 rounded-full border border-red-500/20 bg-red-500/5 hover:bg-red-500 hover:text-white text-red-400 font-extrabold text-xs transition-all active:scale-95 flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0"
							>
								{/* Unlock sign */}
								<svg
									className="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2.5"
										d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
									/>
								</svg>
								<span>
									{isRtl
										? "إنهاء الجلسة / خروج"
										: "End Session / Log out"}
								</span>
							</button>
						</div>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
						{/* Left Menu Selection list (8 columns) */}
						<div className="lg:col-span-8 space-y-6">
							<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-1">
								<h2 className="text-lg font-black text-white flex items-center gap-2">
									<span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
									{isRtl
										? "قائمة الأصناف والمأكولات المتوفرة"
										: "Premium Catering Menu"}
								</h2>

								{/* Category Select tabs */}
								<div className="flex flex-wrap gap-1.5">
									{categories.map((cat) => (
										<button
											key={cat}
											onClick={() =>
												setActiveCategory(cat)
											}
											className={`px-3.5 py-1.5 rounded-full text-[10px] font-black transition-all active:scale-95 ${
												activeCategory === cat
													? "bg-amber-500 text-black font-extrabold shadow-lg shadow-amber-500/10"
													: "bg-white/5 text-zinc-400 hover:text-white border border-white/5"
											}`}
										>
											{getCategoryLabel(cat)}
										</button>
									))}
								</div>
							</div>

							{/* Menu Grid */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{filteredItems.map((item) => {
									const qty = quantities[item.id] || 1;
									return (
										<div
											key={item.id}
											className="rounded-3xl border border-white/10 bg-[#131522] p-5.5 hover:border-amber-500/30 transition-all duration-300 flex flex-col justify-between gap-4 group shadow-md"
										>
											<div className="space-y-2">
												<div className="flex justify-between items-start gap-2">
													<span className="px-2.5 py-1 rounded-full text-[9px] font-black bg-[#0d0f17] text-amber-400/90 border border-white/5">
														{isRtl
															? item.category_ar
															: item.category_en}
													</span>
													<span className="text-xs font-black text-amber-400">
														{item.price.toLocaleString(
															"en-US",
														)}{" "}
														{isRtl ? "د.ع" : "IQD"}
													</span>
												</div>
												<h3 className="text-sm font-black text-white group-hover:text-amber-300 transition-colors">
													{isRtl
														? item.name_ar
														: item.name_en}
												</h3>
												<p className="text-xs text-zinc-400 leading-relaxed font-medium">
													{isRtl
														? item.desc_ar
														: item.desc_en}
												</p>
											</div>

											<div className="pt-2 border-t border-white/5 flex items-center justify-between gap-3">
												{/* Counter control UI */}
												<div className="flex items-center bg-[#0d0f17] border border-white/10 rounded-full p-0.5 shrink-0">
													<button
														type="button"
														onClick={() =>
															adjustQuantity(
																item.id,
																-1,
															)
														}
														className="h-7 w-7 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/5 font-extrabold transition-all"
													>
														-
													</button>
													<span className="w-8 text-center text-xs font-black text-white">
														{qty}
													</span>
													<button
														type="button"
														onClick={() =>
															adjustQuantity(
																item.id,
																1,
															)
														}
														className="h-7 w-7 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/5 font-extrabold transition-all"
													>
														+
													</button>
												</div>

												{/* Place order button */}
												<button
													onClick={() =>
														handlePlaceOrder(item)
													}
													className="flex-1 py-2.5 px-4 rounded-full bg-amber-500 hover:bg-amber-400 text-[#07080a] font-black text-xs transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
												>
													<svg
														className="w-3.5 h-3.5"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
														xmlns="http://www.w3.org/2000/svg"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth="2.5"
															d="M12 4v16m8-8H4"
														/>
													</svg>
													<span>
														{isRtl
															? "اطلب الآن"
															: "Order Now"}
													</span>
												</button>
											</div>
										</div>
									);
								})}
							</div>
						</div>

						{/* Right active Bill & cancellations side section (4 columns) */}
						<div className="lg:col-span-4 space-y-6">
							{/* Premium Billing Widget */}
							<div className="rounded-[28px] border border-amber-500/30 bg-[#1a1c2c]/90 p-6 shadow-2xl relative overflow-hidden flex flex-col gap-4">
								<div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/10 blur-[60px] pointer-events-none" />

								<div>
									<span className="text-[10px] font-black text-amber-400/90 tracking-widest uppercase">
										{isRtl
											? "مجموع الفاتورة الحالية للطاولة"
											: "Active Table Bill Summary"}
									</span>
									<h3 className="text-3xl font-black text-white mt-1">
										{totalBill.toLocaleString("en-US")}{" "}
										<span className="text-sm font-black text-amber-400">
											{isRtl ? "د.ع" : "IQD"}
										</span>
									</h3>
								</div>

								<div className="divide-y divide-white/5 text-xs text-zinc-300">
									<div className="py-2.5 flex justify-between">
										<span>
											{isRtl
												? "رقم الحجز المرجعي:"
												: "Booking Identifier:"}
										</span>
										<span className="font-bold text-white">
											{activeSession.number}
										</span>
									</div>
									<div className="py-2.5 flex justify-between">
										<span>
											{isRtl
												? "اسم العميل صاحب الطاولة:"
												: "Guest Full Name:"}
										</span>
										<span className="font-bold text-white">
											{activeSession.client_name}
										</span>
									</div>
									<div className="py-2.5 flex justify-between">
										<span>
											{isRtl
												? "موقع الطاولة الحالي:"
												: "Table Location:"}
										</span>
										<span className="font-bold text-amber-300">
											{
												activeSession.room_name.split(
													" ",
												)[0]
											}
										</span>
									</div>
									<div className="py-2.5 flex justify-between">
										<span>
											{isRtl
												? "إجمالي عدد الأصناف المطلوبة:"
												: "Total Ordered Pieces:"}
										</span>
										<span className="font-bold text-white">
											{tableOrders.reduce(
												(sum, o) => sum + o.quantity,
												0,
											)}{" "}
											{isRtl ? "وحدات" : "Units"}
										</span>
									</div>
								</div>
							</div>

							{/* Active Orders List with Cancellations */}
							<div className="rounded-[28px] border border-white/10 bg-[#131522] p-5.5 shadow-xl space-y-4">
								<h3 className="text-sm font-black text-white border-b border-white/5 pb-3 flex items-center justify-between">
									<span>
										{isRtl
											? "طلباتك النشطة الآن"
											: "My Active Table Orders"}
									</span>
									<span className="px-2.5 py-0.5 rounded-full text-[9px] font-black bg-[#0d0f17] text-zinc-400 border border-white/5">
										{tableOrders.length}
									</span>
								</h3>

								<div className="space-y-3 max-h-96 overflow-y-auto pr-1">
									{tableOrders.length > 0 ? (
										tableOrders.map((o) => (
											<div
												key={o.id}
												className="p-3 rounded-2xl bg-[#0d0f17]/60 border border-white/5 flex items-center justify-between gap-3 group/item hover:border-white/10 transition-all"
											>
												<div className="space-y-1">
													<p className="text-xs font-black text-white group-hover/item:text-amber-300 transition-colors leading-snug">
														{o.item_name}
													</p>
													<p className="text-[10px] text-zinc-400 font-bold">
														{o.quantity} ×{" "}
														{o.item_price.toLocaleString(
															"en-US",
														)}{" "}
														{isRtl ? "د.ع" : "IQD"}
													</p>
													<p className="text-[9px] text-zinc-500 font-medium font-mono">
														{o.createdAt
															.split(" ")
															.slice(2)
															.join(" ")}
													</p>
												</div>

												<div className="flex items-center gap-2">
													<span className="text-xs font-black text-amber-400 shrink-0">
														{(
															o.item_price *
															o.quantity
														).toLocaleString(
															"en-US",
														)}{" "}
														{isRtl ? "د.ع" : "IQD"}
													</span>

													{/* Cancel action trigger */}
													<button
														onClick={() =>
															handleCancelOrder(
																o.id,
																o.item_name,
															)
														}
														className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 hover:bg-red-500 hover:text-white transition-all shrink-0 active:scale-95"
														title={
															isRtl
																? "إلغاء الطلب"
																: "Cancel Order"
														}
													>
														<svg
															className="w-3.5 h-3.5"
															fill="none"
															stroke="currentColor"
															viewBox="0 0 24 24"
															xmlns="http://www.w3.org/2000/svg"
														>
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																strokeWidth="2.5"
																d="M6 18L18 6M6 6l12 12"
															/>
														</svg>
													</button>
												</div>
											</div>
										))
									) : (
										<div className="py-10 text-center text-zinc-600 font-medium text-xs italic">
											{isRtl
												? "لم تقم بطلب أي أصناف لطاولتك بعد!"
												: "No items ordered for this table yet!"}
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
				</main>
			)}

			{/* VIEW MODAL: ANIMATED QR VIEWVIEWFINDER SCANNER SIMULATOR & CAMERA */}
			{isScannerOpen && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
					dir={isRtl ? "rtl" : "ltr"}
				>
					<div className="max-w-md w-full rounded-3xl border border-white/15 bg-[#131522]/95 backdrop-blur-xl p-6 shadow-2xl relative space-y-6">
						{/* Dismiss button */}
						<button
							onClick={() =>
								!scanLoading && setIsScannerOpen(false)
							}
							className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors disabled:opacity-20 disabled:pointer-events-none cursor-pointer"
							disabled={scanLoading}
						>
							<svg
								className="w-5 h-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2.5"
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>

						<div className="text-center">
							<h2 className="text-base font-black text-white">
								{isRtl
									? "مسح الـ QR وقفل الجلسة الأمنية"
									: "QR Table Scan & Verification"}
							</h2>
							<p className="text-xs text-zinc-400 mt-1">
								{isRtl
									? "وجه كاميرا جوالك إلى الرمز، أو قم بمحاكاة المسح عبر الرموز المتاحة أدناه"
									: "Point your phone camera at the QR, or simulate scanning using the codes below"}
							</p>
						</div>

						{/* SCANNING EYE VIEW FINDER BOX */}
						<div className="relative mx-auto h-48 w-48 rounded-2xl border border-white/10 bg-[#07080a] overflow-hidden flex flex-col items-center justify-center shadow-inner">
							{/* Live camera stream feed video element */}
							<video
								ref={videoRef}
								id="scannerVideo"
								playsInline
								muted
								autoPlay
								className={`absolute inset-0 w-full h-full object-cover z-0 ${cameraStream ? "block" : "hidden"}`}
							/>

							{/* Simulated Corner Brackets green */}
							<div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-green-400 rounded-tl-md z-10" />
							<div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-green-400 rounded-tr-md z-10" />
							<div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-green-400 rounded-bl-md z-10" />
							<div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-green-400 rounded-br-md z-10" />

							{/* Sweeping Laser Scan Line */}
							{scanStep === "scanning" && (
								<div className="absolute left-1 right-1 h-0.5 bg-red-500 shadow-md shadow-red-500/80 animate-laser z-20" />
							)}

							{/* Simulated icons based on scan state */}
							{scanStep === "idle" && !cameraStream && (
								<svg
									className="w-12 h-12 text-zinc-600 animate-pulse z-10"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="1.5"
										d="M12 4v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"
									/>
								</svg>
							)}

							{scanStep === "scanning" && !cameraStream && (
								<div className="text-center space-y-2 z-10">
									<div className="animate-spin h-5 w-5 border-2 border-amber-500 border-t-transparent rounded-full mx-auto" />
									<p className="text-[10px] text-amber-400 font-bold">
										{isRtl
											? "جاري قراءة المعرف..."
											: "Decoding..."}
									</p>
								</div>
							)}

							{scanStep === "success" && (
								<div className="text-center space-y-1.5 z-30 text-green-400 scale-110 transition-transform duration-300 bg-[#07080a]/80 p-3 rounded-xl backdrop-blur-sm">
									<svg
										className="w-10 h-10 mx-auto"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2.5"
											d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
									<p className="text-[10px] font-black">
										{isRtl ? "تم التحقق!" : "Verified!"}
									</p>
								</div>
							)}

							{scanStep === "error" && (
								<div className="text-center space-y-1.5 z-30 text-red-400 scale-105 transition-transform bg-[#07080a]/80 p-3 rounded-xl backdrop-blur-sm">
									<svg
										className="w-10 h-10 mx-auto"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2.5"
											d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
									<p className="text-[10px] font-black">
										{isRtl ? "فشل الحجز!" : "Failed!"}
									</p>
								</div>
							)}
						</div>

						{/* STICKER SIMULATORS PANEL */}
						<div className="space-y-2.5">
							<span className="text-[10px] text-zinc-500 font-black uppercase tracking-wider block text-center">
								{isRtl
									? "انقر لتحديد رمز الـ QR للطاولة ومطابقة حجز اليوم:"
									: "Select a table QR to match today's reservation:"}
							</span>

							<div className="grid grid-cols-1 gap-2">
								{/* STICKER 1 - Table VIP 1 - CONFIRMED today! */}
								<button
									type="button"
									disabled={scanLoading}
									onClick={() =>
										handleSimulateScan("rm1", "VIP 1")
									}
									className="p-3.5 rounded-2xl bg-[#0d0f17] border border-white/10 hover:border-amber-500/40 text-left transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-between gap-3 group cursor-pointer"
								>
									<div className="space-y-1">
										<p className="text-xs font-black text-white group-hover:text-amber-300">
											{isRtl
												? "رمز QR: طاولة VIP 1"
												: "QR: Table VIP 1"}
										</p>
										<p className="text-[10px] text-green-400 font-bold">
											{isRtl
												? "حجز مؤكد اليوم (سليمان)"
												: "Confirmed Booking Today (Suleiman)"}
										</p>
									</div>
									<span className="text-xs font-black text-zinc-400 uppercase font-mono bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
										{isRtl ? "مسح الرمز" : "Scan Code"}
									</span>
								</button>

								{/* STICKER 2 - Table 4 - TOMORROW */}
								<button
									type="button"
									disabled={scanLoading}
									onClick={() =>
										handleSimulateScan(
											"rm2",
											"طاولة عائلية 4",
										)
									}
									className="p-3.5 rounded-2xl bg-[#0d0f17] border border-white/10 hover:border-amber-500/40 text-left transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-between gap-3 group cursor-pointer"
								>
									<div className="space-y-1">
										<p className="text-xs font-black text-white group-hover:text-amber-300">
											{isRtl
												? "رمز QR: طاولة عائلية 4"
												: "QR: Family Table 4"}
										</p>
										<p className="text-[10px] text-zinc-400 font-semibold">
											{isRtl
												? "حجز معلق الغد (أحمد العتيبي)"
												: "Pending Tomorrow (Ahmed)"}
										</p>
									</div>
									<span className="text-xs font-black text-zinc-400 uppercase font-mono bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
										{isRtl ? "مسح الرمز" : "Scan Code"}
									</span>
								</button>

								{/* STICKER 3 - Table 2 - FUTURE */}
								<button
									type="button"
									disabled={scanLoading}
									onClick={() =>
										handleSimulateScan(
											"rm3",
											"طاولة ثنائية 2",
										)
									}
									className="p-3.5 rounded-2xl bg-[#0d0f17] border border-white/10 hover:border-amber-500/40 text-left transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-between gap-3 group cursor-pointer"
								>
									<div className="space-y-1">
										<p className="text-xs font-black text-white group-hover:text-amber-300">
											{isRtl
												? "رمز QR: طاولة ثنائية 2"
												: "QR: Double Table 2"}
										</p>
										<p className="text-[10px] text-zinc-400 font-semibold">
											{isRtl
												? "حجز مؤكد في 14 مايو (سارة)"
												: "Confirmed May 14 (Sarah)"}
										</p>
									</div>
									<span className="text-xs font-black text-zinc-400 uppercase font-mono bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
										{isRtl ? "مسح الرمز" : "Scan Code"}
									</span>
								</button>
							</div>
						</div>

						{/* Alert feedback for scanner issues */}
						{scanErrorMsg && (
							<div className="p-4 rounded-2xl bg-[#1e0a0a] border border-red-500/25 text-red-300 text-xs font-medium leading-relaxed">
								{scanErrorMsg}
							</div>
						)}
					</div>
				</div>
			)}

			{/* Footer */}
			<footer className="py-8 border-t border-white/10 text-center text-xs text-zinc-500 bg-[#07080a]">
				<p className="max-w-7xl mx-auto px-6">{t("home.footer")}</p>
			</footer>
		</div>
	);
}
