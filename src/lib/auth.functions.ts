import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import type { SessionUser } from "#/lib/auth";
import { createMockSession, getSessionUser } from "#/lib/auth.server";
import { serverConfig } from "#/lib/config";

export const getCurrentUserFn = createServerFn({ method: "GET" }).handler(
	async (): Promise<SessionUser | null> => {
		return getSessionUser();
	},
);

export const getAuthStatusFn = createServerFn({ method: "GET" }).handler(
	async () => {
		const user = await getSessionUser();
		return {
			user,
			authMock: serverConfig.authMock,
			authConfigured: Boolean(
				serverConfig.authentik.issuer &&
					serverConfig.authentik.clientId &&
					serverConfig.authentik.clientSecret,
			),
		};
	},
);

export const mockLoginFn = createServerFn({ method: "POST" })
	.validator(
		(data: { role: "admin" | "sports" | "announcements" | "reports" }) => data,
	)
	.handler(async ({ data }) => {
		await createMockSession(data.role);
		throw redirect({ to: "/" });
	});
