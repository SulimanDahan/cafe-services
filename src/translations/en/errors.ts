export const errors = {
	unauthorized: {
		title: "Unauthorized Access",
		desc: "Sorry, you do not have sufficient permissions to access this page or directory. Please consult the system administrator or log in with administrative credentials.",
		btnAdmin: "Admin Portal",
		btnHome: "Home Page",
		code: "Error Code: HTTP 403 FORBIDDEN",
	},
	notFound: {
		title: "Page Not Found",
		desc: "Sorry, the page you are looking for does not exist. The link may be incorrect, or the page has been deleted or moved to another location.",
		btnHome: "Return to Home Page",
		code: "Error Code: HTTP 404 NOT FOUND",
	},
	serverError: {
		title: "An Unexpected System Error Occurred",
		desc: "Sorry, the server is currently experiencing an internal technical issue in fulfilling your request. We are working diligently to resolve the issue as quickly as possible.",
		btnRetry: "Retry",
		btnHome: "Home Page",
		code: "Error Code: HTTP 500 INTERNAL SERVER ERROR",
	}
} as const;
