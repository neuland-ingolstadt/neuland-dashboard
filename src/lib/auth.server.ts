import { redirect } from "@tanstack/react-router";
import { setResponseStatus } from "@tanstack/react-start/server";
import * as client from "openid-client";
import type { AppCapability, SessionUser } from "#/lib/auth";
import {
	canAccessAnnouncements,
	canAccessAudit,
	canAccessOps,
	canAccessReports,
	canAccessSports,
	hasAppAccess,
	hasCapability,
} from "#/lib/auth";
import { getCallbackUrl, serverConfig } from "#/lib/config";
import { getAppSession } from "#/lib/session";

let oidcConfigPromise: Promise<client.Configuration> | null = null;

export function isAuthConfigured(): boolean {
	const { issuer, clientId, clientSecret } = serverConfig.authentik;
	return Boolean(issuer && clientId && clientSecret);
}

async function getOidcConfig(): Promise<client.Configuration> {
	if (!isAuthConfigured()) {
		throw new Error(
			"Authentik OIDC is not configured. Set AUTHENTIK_ISSUER, AUTHENTIK_CLIENT_ID, AUTHENTIK_CLIENT_SECRET.",
		);
	}

	if (!oidcConfigPromise) {
		const { issuer, clientId, clientSecret } = serverConfig.authentik;
		oidcConfigPromise = client.discovery(
			new URL(issuer),
			clientId,
			{ client_secret: clientSecret },
			client.ClientSecretPost(clientSecret),
		);
	}

	return oidcConfigPromise;
}

export function mapGroupsToCapabilities(groups: string[]): AppCapability[] {
	const caps = new Set<AppCapability>();
	const sportsName = serverConfig.groups.sports.toLowerCase();
	const announcementsName = serverConfig.groups.announcements.toLowerCase();
	const reportsName = serverConfig.groups.reports.toLowerCase();
	const adminName = serverConfig.groups.admin.toLowerCase();

	for (const group of groups) {
		const normalized = group.trim().toLowerCase();
		if (normalized === sportsName) {
			caps.add("sports");
		}
		if (normalized === announcementsName) {
			caps.add("announcements");
		}
		if (normalized === reportsName) {
			caps.add("reports");
			caps.add("ops");
		}
		if (normalized === adminName) {
			caps.add("admin");
		}
	}

	return [...caps];
}

export function extractGroupsClaim(source: unknown): string[] {
	if (!source || typeof source !== "object") return [];
	const raw = (source as Record<string, unknown>).groups;
	if (raw == null) return [];

	const values = Array.isArray(raw) ? raw : [raw];
	const names: string[] = [];

	for (const entry of values) {
		if (typeof entry === "string" && entry.trim()) {
			names.push(entry.trim());
			continue;
		}
		if (entry && typeof entry === "object") {
			const name = (entry as { name?: unknown }).name;
			if (typeof name === "string" && name.trim()) names.push(name.trim());
		}
	}

	return [...new Set(names)];
}

export async function buildLoginRedirectUrl(): Promise<string> {
	const config = await getOidcConfig();
	const codeVerifier = client.randomPKCECodeVerifier();
	const codeChallenge = await client.calculatePKCECodeChallenge(codeVerifier);
	const state = client.randomState();
	const nonce = client.randomNonce();

	const session = await getAppSession();
	await session.update({
		oauth: { codeVerifier, state, nonce },
	});

	const parameters: Record<string, string> = {
		redirect_uri: getCallbackUrl(),
		scope: "openid profile email groups offline_access",
		code_challenge: codeChallenge,
		code_challenge_method: "S256",
		state,
		nonce,
		response_type: "code",
	};

	const redirectTo = client.buildAuthorizationUrl(config, parameters);
	return redirectTo.href;
}

export async function handleOidcCallback(
	callbackUrl: URL,
): Promise<SessionUser> {
	const config = await getOidcConfig();
	const session = await getAppSession();
	const oauth = session.data.oauth;

	if (!oauth?.codeVerifier || !oauth.state || !oauth.nonce) {
		throw new Error("oauth_session_missing");
	}

	const canonicalCallbackUrl = new URL(
		`${callbackUrl.pathname}${callbackUrl.search}`,
		serverConfig.appUrl,
	);

	const tokens = await client.authorizationCodeGrant(
		config,
		canonicalCallbackUrl,
		{
			pkceCodeVerifier: oauth.codeVerifier,
			expectedState: oauth.state,
			expectedNonce: oauth.nonce,
		},
	);

	const claims = tokens.claims();
	if (!claims?.sub) {
		throw new Error("id_token_missing_sub");
	}

	const claimRecord = claims as Record<string, unknown>;
	let email = typeof claims.email === "string" ? claims.email : "";
	let name =
		typeof claims.name === "string"
			? claims.name
			: typeof claims.preferred_username === "string"
				? claims.preferred_username
				: email || claims.sub;
	let userInfo: Record<string, unknown> | null = null;

	if (tokens.access_token) {
		try {
			const info = await client.fetchUserInfo(
				config,
				tokens.access_token,
				claims.sub,
			);
			userInfo = info as Record<string, unknown>;
			if (typeof info.email === "string") email = info.email;
			if (typeof info.name === "string") name = info.name;
			else if (typeof info.preferred_username === "string") {
				name = info.preferred_username;
			}
		} catch (err) {
			console.warn("[auth] userinfo fetch failed", err);
		}
	}

	const groups = [
		...extractGroupsClaim(claimRecord),
		...extractGroupsClaim(userInfo),
	];
	const uniqueGroups = [...new Set(groups)];
	const capabilities = mapGroupsToCapabilities(uniqueGroups);

	const user: SessionUser = {
		sub: claims.sub,
		email,
		name,
		groups: uniqueGroups,
		capabilities,
	};

	const expiresIn =
		typeof tokens.expires_in === "number" ? tokens.expires_in : 3600;

	await session.update({
		user,
		idToken: tokens.id_token,
		accessToken: tokens.access_token,
		accessTokenExpires: Date.now() + expiresIn * 1000,
		refreshToken: tokens.refresh_token,
		oauth: undefined,
	});

	return user;
}

async function refreshAccessToken(): Promise<string | null> {
	const session = await getAppSession();
	const refreshToken = session.data.refreshToken;
	if (!refreshToken || !isAuthConfigured()) {
		await session.clear();
		return null;
	}

	try {
		const config = await getOidcConfig();
		const tokens = await client.refreshTokenGrant(config, refreshToken);
		if (!tokens.access_token) {
			console.error("[auth] refresh returned no access_token");
			await session.clear();
			return null;
		}

		const expiresIn =
			typeof tokens.expires_in === "number" ? tokens.expires_in : 3600;

		await session.update({
			accessToken: tokens.access_token,
			accessTokenExpires: Date.now() + expiresIn * 1000,
			refreshToken: tokens.refresh_token ?? refreshToken,
			idToken: tokens.id_token ?? session.data.idToken,
		});

		return tokens.access_token;
	} catch (err) {
		console.error("[auth] refresh failed", err);
		await session.clear();
		return null;
	}
}

/** Returns a valid OIDC access token, refreshing if needed. */
export async function getAccessToken(): Promise<string | null> {
	const session = await getAppSession();
	const { accessToken, accessTokenExpires } = session.data;

	if (
		accessToken &&
		accessTokenExpires &&
		Date.now() < accessTokenExpires - 60_000
	) {
		return accessToken;
	}

	return refreshAccessToken();
}

/** Drop the cookie session and send the user back to login. */
function throwSessionExpired(options?: { asJson?: boolean }): never {
	if (options?.asJson) {
		setResponseStatus(401);
		throw new Error("Sitzung abgelaufen");
	}
	throw redirect({ to: "/login" });
}

export async function buildLogoutRedirectUrl(): Promise<string> {
	const session = await getAppSession();
	const idToken = session.data.idToken;
	await session.clear();

	if (!isAuthConfigured()) {
		return new URL("/login", serverConfig.appUrl).toString();
	}

	try {
		const config = await getOidcConfig();
		const endSession = config.serverMetadata().end_session_endpoint;
		if (endSession) {
			const url = new URL(endSession);
			url.searchParams.set(
				"post_logout_redirect_uri",
				new URL("/login", serverConfig.appUrl).toString(),
			);
			if (idToken) url.searchParams.set("id_token_hint", idToken);
			return url.toString();
		}
	} catch (err) {
		console.warn("[auth] logout discovery failed", err);
	}

	return new URL("/login", serverConfig.appUrl).toString();
}

export async function getSessionUser(): Promise<SessionUser | null> {
	const session = await getAppSession();
	const user = session.data.user;
	if (!user) return null;

	// Ensure the OIDC access token is still usable (refresh via offline_access).
	// Clears the cookie when refresh is impossible so routes redirect to login.
	const accessToken = await getAccessToken();
	if (!accessToken) return null;

	return {
		sub: user.sub,
		email: user.email,
		name: user.name,
		groups: user.groups,
		capabilities: user.capabilities,
	};
}

export async function requireSessionUser(): Promise<SessionUser> {
	const user = await getSessionUser();
	if (!user) {
		throw redirect({ to: "/login" });
	}
	return user;
}

export async function requireAppAccess(options?: {
	asJson?: boolean;
}): Promise<SessionUser> {
	const user = await getSessionUser();

	if (!user) {
		if (options?.asJson) {
			setResponseStatus(401);
			throw new Error("Nicht angemeldet");
		}
		throw redirect({ to: "/login" });
	}

	if (!hasAppAccess(user.capabilities)) {
		if (options?.asJson) {
			setResponseStatus(403);
			throw new Error("Kein Zugang");
		}
		throw redirect({ to: "/no-access" });
	}

	return user;
}

export type RequireableCapability = Exclude<AppCapability, "admin"> | "admin";

export async function requireCapability(
	capability: RequireableCapability,
	options?: { asJson?: boolean },
): Promise<SessionUser> {
	const user = await requireAppAccess(options);
	const allowed =
		capability === "admin"
			? user.capabilities.includes("admin")
			: hasCapability(user.capabilities, capability);

	if (!allowed) {
		if (options?.asJson) {
			setResponseStatus(403);
			throw new Error("Kein Zugang");
		}
		throw redirect({ to: "/" });
	}

	return user;
}

export async function requireAccessToken(options?: {
	asJson?: boolean;
}): Promise<{
	user: SessionUser;
	accessToken: string;
}> {
	const user = await requireAppAccess(options);
	const accessToken = await getAccessToken();
	if (!accessToken) {
		throwSessionExpired(options);
	}
	return { user, accessToken };
}

export type MockAuthRole =
	| "admin"
	| "sports"
	| "announcements"
	| "reports"
	| "none";

export async function createMockSession(
	role: MockAuthRole,
): Promise<SessionUser> {
	if (!serverConfig.authMock) {
		throw new Error("Mock-Auth ist deaktiviert.");
	}

	const capabilities: AppCapability[] =
		role === "admin"
			? ["admin"]
			: role === "sports"
				? ["sports"]
				: role === "announcements"
					? ["announcements"]
					: role === "reports"
						? ["reports", "ops"]
						: [];

	const groups =
		role === "none"
			? []
			: role === "admin"
				? [serverConfig.groups.admin]
				: role === "sports"
					? [serverConfig.groups.sports]
					: role === "announcements"
						? [serverConfig.groups.announcements]
						: [serverConfig.groups.reports];

	const user: SessionUser = {
		sub: `mock-${role}`,
		email: `${role}@neuland.local`,
		name: `Mock ${role}`,
		groups,
		capabilities,
	};

	const session = await getAppSession();
	await session.update({
		user,
		idToken: undefined,
		accessToken: "mock-token",
		accessTokenExpires: Date.now() + 8 * 60 * 60 * 1000,
		refreshToken: undefined,
		oauth: undefined,
	});
	return user;
}

export {
	canAccessAnnouncements,
	canAccessAudit,
	canAccessOps,
	canAccessReports,
	canAccessSports,
	hasAppAccess,
};
