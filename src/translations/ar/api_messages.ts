export const apiMessages = {
	success: {
		login: "تم تسجيل الدخول بنجاح",
		logout: "تم تسجيل الخروج بنجاح",
		save: "تم الحفظ بنجاح",
		delete: "تم الحذف بنجاح",
		add: "تم الإضافة بنجاح",
		update: "تم التحديث بنجاح",
		sessionRefreshed: "تم تحديث الجلسة بنجاح.",
		notificationCreated: "تم إنشاء الإشعار وبثه بنجاح!",
	},
	error: {
		dataError: "اسم المستخدم أو كلمة المرور غير صحيحة",
		unauthorized: "غير مصرح، يرجى تسجيل الدخول.",
		sessionExpired: "انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى.",
		notFound: "يرجى تسجيل الدخول مرة أخرى",
		serverError: "خطأ داخلي في الخادم.",
		settingsNotFound: "لم يتم العثور على الإعدادات.",
		missingFields: "العنوان أو نص الرسالة مفقود.",
	},
} as const;

export default apiMessages;
