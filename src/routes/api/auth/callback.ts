import { createFileRoute } from "@tanstack/react-router";
import { hasAppAccess } from "#/lib/auth";
import { handleOidcCallback } from "#/lib/auth.server";
import { serverConfig } from "#/lib/config";
import { redirectResponse } from "#/lib/http";

export const Route = createFileRoute("/api/auth/callback")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				try {
					const user = await handleOidcCallback(new URL(request.url));
					const target = hasAppAccess(user.capabilities) ? "/" : "/no-access";
					return redirectResponse(
						new URL(target, serverConfig.appUrl).toString(),
					);
				} catch (err) {
					console.error("[auth/callback]", err);
					const code =
						err instanceof Error &&
						(err.message === "oauth_session_missing" ||
							err.message === "id_token_missing_sub")
							? err.message
							: "login_failed";
					const login = new URL("/login", serverConfig.appUrl);
					login.searchParams.set("error", code);
					return redirectResponse(login.toString());
				}
			},
		},
	},
});
