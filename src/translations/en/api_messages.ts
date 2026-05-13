const apiMessages = {
	success: {
		login: "Logged in successfully",
		logout: "Logged out successfully",
		save: "Saved successfully",
		delete: "Deleted successfully",
		add: "Added successfully",
		update: "Updated successfully",
	},
	error: {
		dataError: "Username or Password is incorrect",
		unauthorized: "Unauthorized",
		notFound: "Not Found",
		serverError: "Server Error",
	},
} as const;

export default apiMessages;
