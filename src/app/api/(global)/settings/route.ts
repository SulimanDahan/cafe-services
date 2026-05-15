import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
export default async function GET() {
    try {
        const settings = await prisma.settings.findFirst();

        // التحقق مما إذا كانت البيانات غير موجودة
        if (!settings) {
            return NextResponse.json(
                {
                    status: 404,
                    success: false,
                    message: "لم يتم العثور على أي إعدادات في قاعدة البيانات.",
                },
                { status: 404 }, // تحديد الـ HTTP Status Code للمتصفح أو العميل
            );
        }

        // في حال وجود البيانات يتم إرجاعها بنجاح
        return NextResponse.json({
            status: 200,
            success: true,
            data: settings,
        });
    } catch {
        // حماية الكود من أي أخطاء غير متوقعة في الاتصال بقاعدة البيانات
        return NextResponse.json(
            {
                status: 500,
                success: false,
                message: "حدث خطأ داخلي في السيرفر أثناء جلب البيانات.",
            },
            { status: 500 },
        );
    }
}
