import { createFileRoute } from "@tanstack/react-router";
import { buildLogoutRedirectUrl } from "#/lib/auth.server";
import { redirectResponse } from "#/lib/http";

export const Route = createFileRoute("/api/auth/logout")({
	server: {
		handlers: {
			GET: async () => {
				const url = await buildLogoutRedirectUrl();
				return redirectResponse(url);
			},
			POST: async () => {
				const url = await buildLogoutRedirectUrl();
				return redirectResponse(url);
			},
		},
	},
});
