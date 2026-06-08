import selfsigned from "selfsigned";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config(); // جلب المتغيرات من ملف .env

// التأكد من وجود المتغير في ملف .env، وإلا استخدام قيمة افتراضية
const SERVER_IP = process.env.SERVER_IP || "192.168.1.100";

async function generateCerts() {
	console.log(`جارٍ توليد شهادات SSL لعنوان ${SERVER_IP}...`);

	const attrs = [{ name: "commonName", value: SERVER_IP }];

	try {
		// الإصدارات الحديثة من حزمة selfsigned تتطلب await
		const pems = await selfsigned.generate(attrs, { days: 3650 });

		fs.writeFileSync("cert.pem", pems.cert);
		fs.writeFileSync("key.pem", pems.private);

		console.log("✅ تم إنشاء الشهادات بنجاح!");
		console.log(
			'يرجى نقل ملفي "cert.pem" و "key.pem" إلى مجلد إعدادات Nginx (مثلاً: C:\\nginx\\conf)',
		);
	} catch (error) {
		console.error("❌ حدث خطأ أثناء التوليد:", error);
	}
}

generateCerts();
