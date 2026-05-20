import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notificationEmitter } from "@/lib/emitter";
import { getServerTranslations } from "@/lib/i18n_server";

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const { items, reservation_id } = body;

		if (!items || !items.length || !reservation_id) {
			return NextResponse.json(
				{ error: "Invalid order data" },
				{ status: 400 },
			);
		}

		const orders = [];

		for (const item of items) {
			const dbItem = await prisma.item.findUnique({
				where: { id: item.id },
			});
			if (dbItem) {
				const order = await prisma.order.create({
					data: {
						reservation_id,
						item_id: item.id,
						item_price: dbItem.price,
						quantity: item.quantity,
					},
					include: { item: true },
				});
				orders.push(order);
				notificationEmitter.emit("new-order", order);
			}
		}

		// Notify Admin
		const reservation = await prisma.reservation.findUnique({
			where: { id: reservation_id },
			include: { room: true },
		});
		if (reservation) {
			const settings = await prisma.settings.findFirst();
			const appLang = (settings?.app_lang === "ar" || !settings?.app_lang) ? "ar" : "en";
			const { t } = getServerTranslations(appLang);

			const title = t("notifications.newOrderTitle");
			const message = t("notifications.newOrderMessage").replace("{room}", reservation.room.name);

			const notification = await prisma.notification.create({
				data: {
					title,
					message,
				},
			});
			notificationEmitter.emit("notification-created", {
				...notification,
				type: "success",
			});
		}

		return NextResponse.json({ success: true, orders });
	} catch (error: unknown) {
		const err = error as { message?: string };
		return NextResponse.json({ error: err.message }, { status: 500 });
	}
}
