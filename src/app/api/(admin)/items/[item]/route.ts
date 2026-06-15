import { itemSchema } from "@/lib/validations/item";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { writeFile, unlink, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

type Params = { params: Promise<{ item: string }> };

/** GET a specific item */
export async function GET(_req: Request, { params }: Params) {
	if (!(await requireAuth()))
		return NextResponse.json(
			{ error: "apiMessages.error.unauthorized" },
			{ status: 401 },
		);
	try {
		const { item: id } = await params;
		const item = await prisma.item.findUnique({
			where: { id },
			include: { group: true },
		});
		if (!item)
			return NextResponse.json(
				{ error: "apiMessages.error.itemNotFound" },
				{ status: 404 },
			);
		return NextResponse.json(item);
	} catch (error) {
		console.error("Error fetching item:", error);
		return NextResponse.json(
			{ error: "apiMessages.error.serverError" },
			{ status: 500 },
		);
	}
}

/** PUT (full update) a specific item */
export async function PUT(request: Request, { params }: Params) {
	if (!(await requireAuth()))
		return NextResponse.json(
			{ error: "apiMessages.error.unauthorized" },
			{ status: 401 },
		);
	try {
		const { item: id } = await params;
		const currentItem = await prisma.item.findUnique({ where: { id } });
		if (!currentItem) {
			return NextResponse.json(
				{ error: "apiMessages.error.itemNotFound" },
				{ status: 404 },
			);
		}

		const contentType = request.headers.get("content-type") || "";
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let body: any = {};
		let imageFile: File | null = null;
		let removeImage = false;

		if (contentType.includes("multipart/form-data")) {
			const formData = await request.formData();

			if (formData.has("name"))
				body.name = formData.get("name")?.toString();
			if (formData.has("price"))
				body.price = formData.get("price")?.toString();
			if (formData.has("group_id"))
				body.group_id = formData.get("group_id")?.toString();
			if (formData.has("is_disable"))
				body.is_disable = formData.get("is_disable") === "true";
			if (formData.has("discount_percentage"))
				body.discount_percentage = formData
					.get("discount_percentage")
					?.toString();
			if (formData.has("discount_value"))
				body.discount_value = formData
					.get("discount_value")
					?.toString();

			if (formData.get("remove_image") === "true") {
				removeImage = true;
			} else {
				const file = formData.get("image");
				if (file && file instanceof File && file.size > 0) {
					imageFile = file;
				}
			}
		} else {
			body = await request.json();
		}

		const validation = itemSchema.partial().safeParse(body);

		if (!validation.success) {
			return NextResponse.json(
				{
					error: "apiMessages.error.validationFailed",
					details: validation.error.format(),
				},
				{ status: 422 },
			);
		}

		const data = validation.data;

		const ordersCount = await prisma.order.count({
			where: { item_id: id },
		});

		const isChangingRestrictedFields =
			(data.name !== undefined && data.name !== currentItem.name) ||
			(data.price !== undefined &&
				Number(data.price) !== Number(currentItem.price)) ||
			(data.group_id !== undefined &&
				data.group_id !== currentItem.group_id) ||
			(data.discount_percentage !== undefined &&
				Number(data.discount_percentage) !==
					Number(currentItem.discount_percentage)) ||
			(data.discount_value !== undefined &&
				Number(data.discount_value) !==
					Number(currentItem.discount_value));

		if (ordersCount > 0 && isChangingRestrictedFields) {
			return NextResponse.json(
				{ error: "apiMessages.error.cannotEditItemWithOrders" },
				{ status: 400 },
			);
		}

		const currentItemWithImage = currentItem as typeof currentItem & {
			image?: string | null;
		};
		let newImagePath = currentItemWithImage.image;

		if (removeImage && currentItemWithImage.image) {
			try {
				const oldPath = path.join(
					process.cwd(),
					"public",
					currentItemWithImage.image,
				);
				await unlink(oldPath);
			} catch (err) {
				console.error("Failed to delete old image:", err);
			}
			newImagePath = null;
		} else if (imageFile) {
			const bytes = await imageFile.arrayBuffer();
			const buffer = Buffer.from(bytes);

			const uploadDir = path.join(process.cwd(), "public/uploads/items");
			await mkdir(uploadDir, { recursive: true });

			const ext = path.extname(imageFile.name) || ".jpg";
			const filename = `${randomUUID()}${ext}`;
			const filepath = path.join(uploadDir, filename);

			await writeFile(filepath, buffer);
			newImagePath = `/uploads/items/${filename}`;

			if (currentItemWithImage.image) {
				try {
					const oldPath = path.join(
						process.cwd(),
						"public",
						currentItemWithImage.image,
					);
					await unlink(oldPath);
				} catch (err) {
					console.error("Failed to delete old image:", err);
				}
			}
		}

		const updated = await prisma.item.update({
			where: { id },
			data: {
				...(data.name !== undefined && { name: data.name }),
				...(data.price !== undefined && { price: data.price }),
				...(data.group_id !== undefined && { group_id: data.group_id }),
				...(data.is_disable !== undefined && {
					is_disable: data.is_disable,
				}),
				...(data.discount_percentage !== undefined && {
					discount_percentage: data.discount_percentage,
				}),
				...(data.discount_value !== undefined && {
					discount_value: data.discount_value,
				}),
				image: newImagePath,
			},
			include: { group: true },
		});

		return NextResponse.json(updated);
	} catch (error: unknown) {
		console.error("Error updating item:", error);
		const err = error as { code?: string };
		if (err.code === "P2025")
			return NextResponse.json(
				{ error: "apiMessages.error.itemNotFound" },
				{ status: 404 },
			);
		return NextResponse.json(
			{ error: "apiMessages.error.serverError" },
			{ status: 500 },
		);
	}
}

/** DELETE a specific item */
export async function DELETE(_req: Request, { params }: Params) {
	if (!(await requireAuth()))
		return NextResponse.json(
			{ error: "apiMessages.error.unauthorized" },
			{ status: 401 },
		);
	try {
		const { item: id } = await params;

		const currentItem = await prisma.item.findUnique({ where: { id } });
		if (!currentItem) {
			return NextResponse.json(
				{ error: "apiMessages.error.itemNotFound" },
				{ status: 404 },
			);
		}

		const ordersCount = await prisma.order.count({
			where: { item_id: id },
		});

		if (ordersCount > 0) {
			return NextResponse.json(
				{ error: "apiMessages.error.itemHasOrders" },
				{ status: 400 },
			);
		}

		await prisma.item.delete({ where: { id } });

		if (currentItem.image) {
			try {
				const imgPath = path.join(
					process.cwd(),
					"public",
					currentItem.image,
				);
				await unlink(imgPath);
			} catch (err) {
				console.error("Failed to delete item image file:", err);
			}
		}

		return NextResponse.json({ success: true });
	} catch (error: unknown) {
		console.error("Error deleting item:", error);
		const err = error as { code?: string };
		if (err.code === "P2025")
			return NextResponse.json(
				{ error: "apiMessages.error.itemNotFound" },
				{ status: 404 },
			);
		return NextResponse.json(
			{ error: "apiMessages.error.serverError" },
			{ status: 500 },
		);
	}
}
