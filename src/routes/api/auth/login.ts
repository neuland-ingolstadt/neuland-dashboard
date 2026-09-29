import { createFileRoute } from "@tanstack/react-router";
import { buildLoginRedirectUrl, isAuthConfigured } from "#/lib/auth.server";
import { serverConfig } from "#/lib/config";
import { redirectResponse } from "#/lib/http";

export const Route = createFileRoute("/api/auth/login")({
	server: {
		handlers: {
			GET: async () => {
				if (!isAuthConfigured()) {
					if (serverConfig.authMock) {
						return redirectResponse(
							new URL("/login?mock=1", serverConfig.appUrl).toString(),
						);
					}
					return new Response(
						"Authentik ist nicht konfiguriert. Setze AUTHENTIK_* Env-Variablen.",
						{ status: 503 },
					);
				}

				const url = await buildLoginRedirectUrl();
				return redirectResponse(url);
			},
		},
	},
});
