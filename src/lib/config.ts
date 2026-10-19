function optional(name: string, fallback = ""): string {
	const value = process.env[name];
	// Dockerfile sets empty ENV placeholders; treat "" like unset.
	if (value == null || value.trim() === "") return fallback;
	return value;
}

const sessionSecret =
	process.env.SESSION_SECRET ?? "dev-only-session-secret-change-me-32chars!!";

export const serverConfig = {
	appUrl: optional("APP_URL", "http://127.0.0.1:43127"),
	sessionSecret,
	authentik: {
		issuer: optional("AUTHENTIK_ISSUER"),
		clientId: optional("AUTHENTIK_CLIENT_ID", optional("AUTHENTIK_ID")),
		clientSecret: optional(
			"AUTHENTIK_CLIENT_SECRET",
			optional("AUTHENTIK_SECRET"),
		),
	},
	groups: {
		sports: optional("SPORTS_GROUP_NAME", "next-dashboard-sports"),
		announcements: optional(
			"ANNOUNCEMENTS_GROUP_NAME",
			"next-dashboard-announcements",
		),
		reports: optional("REPORTS_GROUP_NAME", "next-dashboard-reports"),
		admin: optional("ADMIN_GROUP_NAME", "next-dashboard-admin"),
	},
	coreapi: {
		url: optional("CORE_API_URL", "https://core.api.neuland.app"),
	},
	s3: {
		region: optional("S3_REGION", "nbg1"),
		endpoint: optional("S3_ENDPOINT", "https://nbg1.your-objectstorage.com"),
		bucket: optional("S3_BUCKET_NAME"),
		accessKeyId: optional("S3_ACCESS_KEY_ID"),
		secretAccessKey: optional("S3_SECRET_ACCESS_KEY"),
	},
	authMock: optional("AUTH_MOCK", "false") === "true",
} as const;

export function getCallbackUrl(): string {
	return new URL("/api/auth/callback", serverConfig.appUrl).toString();
}

export function assertSessionSecret(): string {
	const value = process.env.SESSION_SECRET ?? sessionSecret;
	if (!value) {
		throw new Error("Missing required environment variable: SESSION_SECRET");
	}
	return value;
}
