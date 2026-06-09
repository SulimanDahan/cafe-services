import { itemSchema } from "@/lib/validations/item";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

/** GET paginated items with optional search and group filter */
export async function GET(request: Request) {
	if (!(await requireAuth()))
		return NextResponse.json(
			{ error: "apiMessages.error.unauthorized" },
			{ status: 401 },
		);
	try {
		const { searchParams } = new URL(request.url);
		const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
		const perPage = Math.max(
			1,
			parseInt(searchParams.get("per_page") || "10", 10),
		);
		const search = searchParams.get("search") || "";
		const groupId = searchParams.get("group_id") || "";

		const where = {
			...(search
				? { name: { contains: search, mode: "insensitive" as const } }
				: {}),
			...(groupId ? { group_id: groupId } : {}),
		};

		const [items, total] = await Promise.all([
			prisma.item.findMany({
				where,
				include: { group: true },
				orderBy: { created_at: "desc" },
				skip: (page - 1) * perPage,
				take: perPage,
			}),
			prisma.item.count({ where }),
		]);

		return NextResponse.json({
			data: items,
			total,
			page,
			totalPages: Math.ceil(total / perPage),
		});
	} catch (error) {
		console.error("Error fetching items:", error);
		return NextResponse.json(
			{ error: "apiMessages.error.fetchItemsFailed" },
			{ status: 500 },
		);
	}
}

/** POST a new item */
export async function POST(request: Request) {
	if (!(await requireAuth()))
		return NextResponse.json(
			{ error: "apiMessages.error.unauthorized" },
			{ status: 401 },
		);
	try {
		const contentType = request.headers.get("content-type") || "";
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let body: any = {};
		let imageFile: File | null = null;

		if (contentType.includes("multipart/form-data")) {
			const formData = await request.formData();
			body.name = formData.get("name")?.toString() || "";
			body.price = formData.get("price")?.toString() || "0";
			body.group_id = formData.get("group_id")?.toString() || "";
			body.is_disable = formData.get("is_disable") === "true";

			const file = formData.get("image");
			if (file && file instanceof File && file.size > 0) {
				imageFile = file;
			}
		} else {
			body = await request.json();
		}

		const validation = itemSchema.safeParse(body);

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
		let imagePath = null;

		if (imageFile) {
			const bytes = await imageFile.arrayBuffer();
			const buffer = Buffer.from(bytes);

			const uploadDir = path.join(process.cwd(), "public/uploads/items");
			await mkdir(uploadDir, { recursive: true });

			const ext = path.extname(imageFile.name) || ".jpg";
			const filename = `${randomUUID()}${ext}`;
			const filepath = path.join(uploadDir, filename);

			await writeFile(filepath, buffer);
			imagePath = `/uploads/items/${filename}`;
		}

		const item = await prisma.item.create({
			data: {
				name: data.name,
				price: data.price ?? 0,
				group_id: data.group_id,
				is_disable: data.is_disable ?? false,
				image: imagePath,
			},
			include: { group: true },
		});

		return NextResponse.json(item, { status: 201 });
	} catch (error: unknown) {
		console.error("Error creating item:", error);
		const err = error as { code?: string };
		if (err.code === "P2002") {
			return NextResponse.json(
				{ error: "apiMessages.error.serverError" },
				{ status: 409 },
			);
		}
		return NextResponse.json(
			{ error: "apiMessages.error.serverError" },
			{ status: 500 },
		);
	}
}
