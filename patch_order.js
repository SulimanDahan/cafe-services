const fs = require('fs');
let content = fs.readFileSync('src/app/(pages)/(user-pages)/order/page.tsx', 'utf-8');

// Replace handleSimulateScan
content = content.replace(/function handleSimulateScan[\s\S]*?const handleLogOutSession/m, `async function handleSimulateScan(roomId: string, tableName: string) {
        setScanLoading(true);
        setScanStep("scanning");
        setScanErrorMsg("");

        try {
            const res = await fetch("/api/order/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ room_id: roomId })
            });

            if (res.ok) {
                const data = await res.json();
                setActiveSession(data.reservation);
                sessionStorage.setItem("cafe_active_session", JSON.stringify(data.reservation));
                setScanStep("success");
                setScanLoading(false);
                setActionMessage({
                    text: isRtl ? \`أهلاً بك عميلنا المميز (\${data.reservation.client_name})! تم فتح الجلسة لطاولة \${tableName}.\` : \`Welcome (\${data.reservation.client_name})! Session unlocked.\`,
                });
                setTimeout(() => { setIsScannerOpen(false); setScanStep("idle"); }, 1200);
            } else {
                setScanLoading(false);
                setScanStep("error");
                setScanErrorMsg(isRtl ? "لا يوجد حجز نشط ومقبول لهذه الطاولة اليوم." : "No active and confirmed reservation found for this table today.");
            }
        } catch (error) {
            setScanLoading(false);
            setScanStep("error");
            setScanErrorMsg("Network Error");
        }
    }

    const handleLogOutSession`);

// Replace handlePlaceOrder
content = content.replace(/const handlePlaceOrder =[\s\S]*?const handleCancelOrder/m, `const handlePlaceOrder = async (item: MenuItem) => {
        if (!activeSession) {
            setActionMessage({ text: isRtl ? "يجب تفعيل الجلسة ومسح الـ QR أولاً" : "Activate session first", isError: true });
            return;
        }

        const qty = quantities[item.id] || 1;
        try {
            const res = await fetch(\`/api/order/\${activeSession.room_id}\`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    reservation_id: activeSession.id,
                    items: [{ id: item.id, quantity: qty }]
                })
            });

            if (res.ok) {
                const newOrder: Order = {
                    id: \`ord-\${Date.now()}\`,
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

                setActionMessage({ text: isRtl ? \`تم إضافة (\${qty} × \${item.name_ar}) لطاولتك!\` : \`Added to your table!\` });
                setQuantities((prev) => ({ ...prev, [item.id]: 1 }));
            } else {
                setActionMessage({ text: isRtl ? "حدث خطأ أثناء الطلب." : "Failed to place order.", isError: true });
            }
        } catch (error) {
            setActionMessage({ text: "Network error", isError: true });
        }
    };

    const handleCancelOrder`);

// Also fix localstorage reading for active session: change to sessionStorage
content = content.replace(/localStorage\.getItem\("cafe_active_session"\)/g, 'sessionStorage.getItem("cafe_active_session")');
content = content.replace(/localStorage\.removeItem\("cafe_active_session"\)/g, 'sessionStorage.removeItem("cafe_active_session")');
content = content.replace(/localStorage\.setItem\("cafe_active_session"/g, 'sessionStorage.setItem("cafe_active_session"');

fs.writeFileSync('src/app/(pages)/(user-pages)/order/page.tsx', content);
