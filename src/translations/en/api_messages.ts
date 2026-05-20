export const apiMessages = {
	success: {
		login: "Logged in successfully",
		logout: "Logged out successfully",
		save: "Saved successfully",
		delete: "Deleted successfully",
		add: "Added successfully",
		update: "Updated successfully",
		sessionRefreshed: "Session refreshed successfully.",
		notificationCreated: "Notification created and broadcasted!",
	},
	error: {
		dataError: "Username or Password is incorrect",
		unauthorized: "Unauthorized, please log in.",
		sessionExpired: "Session expired, please log in again.",
		notFound: "Not Found",
		serverError: "Internal server error.",
		settingsNotFound: "Settings not found.",
		missingFields: "Missing title or message.",
	},
} as const;

export default apiMessages;
