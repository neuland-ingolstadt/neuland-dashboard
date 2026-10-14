import {
	clearSession,
	getSession,
	updateSession,
} from "@tanstack/react-start/server";
import type { SessionUser } from "#/lib/auth";
import { assertSessionSecret } from "#/lib/config";

export type AppSessionData = {
	user?: SessionUser;
	/** OIDC ID token - server-only, used for logout id_token_hint. */
	idToken?: string;
	/** OIDC access token - server-only. Never send to client. */
	accessToken?: string;
	accessTokenExpires?: number;
	refreshToken?: string;
	oauth?: {
		codeVerifier: string;
		state: string;
		nonce: string;
	};
};

function sessionConfig() {
	return {
		name: "neuland-dashboard-session",
		password: assertSessionSecret(),
		cookie: {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax" as const,
			maxAge: 60 * 60 * 8,
			path: "/",
		},
	};
}

export async function getAppSession() {
	const config = sessionConfig();
	const session = await getSession<AppSessionData>(config);

	return {
		data: session.data as AppSessionData,
		async update(data: Partial<AppSessionData>) {
			await updateSession<AppSessionData>(config, data);
		},
		async clear() {
			await clearSession(config);
		},
	};
}
