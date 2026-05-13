const apiMessages = {
	success: {
		login: "تم تسجيل الدخول بنجاح",
		logout: "تم تسجيل الخروج بنجاح",
		save: "تم الحفظ بنجاح",
		delete: "تم الحذف بنجاح",
		add: "تم الإضافة بنجاح",
		update: "تم التحديث بنجاح",
	},
	error: {
		dataError: "اسم المستخدم أو كلمة المرور غير صحيحة",
		unauthorized: "غير مصرح",
		notFound: "يرجى تسجيل الدخول مرة أخرى",
		serverError: "يرجى تسجيل الدخول مرة أخرى",
	},
} as const;

export default apiMessages;
