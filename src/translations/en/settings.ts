export const settings = {
	title: "Global System Settings",
	subtitle:
		"Customize default system currency, application display language, and high priority billing alert thresholds.",
	sectionRules: "Cafe Booking & Reservation Rules",
	inputDuration: "Default Booking Duration (Hours)",
	inputCurrency: "Official Currency Code",
	inputTax: "Sales Tax Rate (%)",
	sectionNotifications: "Notifications & Priority Settings",
	toggleAllow: "Enable Audio Chime Alerts",
	toggleAllowDesc:
		"Play sensory chime sound on admin dashboard instantly when bookings/orders arrive",
	inputThreshold: "High Priority Billing Threshold",
	inputThresholdDesc:
		"Trigger distinctive alert banners for orders and bookings exceeding this amount.",
	sectionIdentity: "System & Localization Settings",
	inputCafeName: "Cafe Name",
	inputContactPhone: "Contact Phone Number",
	inputDefaultCurrency: "Default Certified Currency",
	inputDefaultCurrencyDesc:
		"Set the official currency code used for displaying bills and financial reports.",
	appLangLabel: "Interface Language (App Language)",
	appLangDesc:
		"Select the primary display language across all admin and customer interfaces.",
	perPageLabel: "Items Per Page",
	perPageDesc:
		"Set the number of rows and elements displayed per page in tables and lists.",
	sectionOperations: "Operational Settings",
	inputOpenHour: "Opening Hours",
	inputCloseHour: "Closing Hours",
	toggleLiveBooking: "Enable Live Room Booking",
	toggleLiveBookingDesc:
		"Enables customers to view and dynamically book empty rooms.",
	sectionSse: "Live Events & Notifications Settings (SSE)",
	toggleChime: "Enable Sound Signals for Admin Console",
	toggleChimeDesc:
		"Synthesize premium alerts natively using the Web Audio API.",
	inputPingInterval: "SSE Keep-Alive Ping Interval",
	inputPingIntervalDesc:
		"Seconds between background pings to prevent system-wide SSE connection dropouts.",
	seconds: "seconds",
	msgSaved: "All platform settings successfully saved!",
	msgError: "An error occurred while saving. Please try again.",
	adminSessionExpiryLabel: "Admin Session Duration",
	adminSessionExpiryDesc:
		"Minutes of inactivity before the admin session expires automatically. Default is 60 minutes (1 hour).",
	clientSessionExpiryLabel: "Client Session Duration",
	clientSessionExpiryDesc:
		"Minutes before the customer's ordering session expires automatically on the order page. Default is 360 minutes (6 hours).",
	minutesUnit: "min",
	btnSaveAll: "Save All Configuration",
	langAr: "العربية (Arabic)",
	langEn: "English (الإنجليزية)",
	toggleForcePasskey: "Force Client Order Passkey Verification",
	toggleForcePasskeyDesc:
		"Require customers to input their reservation order passkey before placing self-service orders via QR.",
	toggleAutoAcceptOrders: "Auto-Accept Customer Orders",
	toggleAutoAcceptOrdersDesc:
		"When enabled, every order placed by a customer will be automatically accepted and approved without requiring manual review from the admin.",
	toggleShowItemImages: "Display Item Images",
	toggleShowItemImagesDesc:
		"Enable displaying item images in the client menu and show the image upload option in the admin panel.",
	sectionBackup: "Database Backup",
	sectionBackupDesc: "Download a complete database snapshot in SQL format to save or restore on another server.",
	btnDownloadBackup: "Download Backup Now (SQL)",
};
