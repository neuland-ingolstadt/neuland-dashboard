export const APP_NAME = "Dashboard" as const;

export const EXTERNAL_LINKS = {
	WEBSITE: "https://neuland-ingolstadt.de",
	WEBSITE_IMPRESSUM: "https://neuland-ingolstadt.de/legal/impressum",
	WEBSITE_DATENSCHUTZ: "https://neuland-ingolstadt.de/legal/datenschutz",
	ANALYTICS: "https://grafana.neuland.ing/d/aptabase-overview",
	STATUS: "https://status.neuland.ing",
	CAMPUS_LIFE: "https://cl.neuland-ingolstadt.de/",
} as const;

export const ROUTES = {
	HOME: "/",
	LOGIN: "/login",
	NO_ACCESS: "/no-access",
	SPORTS: "/sports",
	SPORTS_NEW: "/sports/new",
	ANNOUNCEMENTS: "/announcements",
	ANNOUNCEMENTS_NEW: "/announcements/new",
	ROOM_REPORTS: "/roomreports",
	AUDIT_LOG: "/auditlog",
	AUTH_LOGIN: "/api/auth/login",
	AUTH_LOGOUT: "/api/auth/logout",
} as const;
