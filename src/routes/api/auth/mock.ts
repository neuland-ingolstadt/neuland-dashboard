import { createFileRoute } from "@tanstack/react-router";
import { hasAppAccess } from "#/lib/auth";
import { createMockSession, type MockAuthRole } from "#/lib/auth.server";
import { serverConfig } from "#/lib/config";
import { redirectResponse } from "#/lib/http";

function parseMockRole(roleParam: string | null): MockAuthRole {
	if (roleParam === "sports") return "sports";
	if (roleParam === "announcements") return "announcements";
	if (roleParam === "reports") return "reports";
	if (roleParam === "admin") return "admin";
	if (roleParam === "none") return "none";
	return "none";
}

export const Route = createFileRoute("/api/auth/mock")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				if (!serverConfig.authMock) {
					return new Response("Mock-Auth deaktiviert", { status: 403 });
				}

				const url = new URL(request.url);
				const role = parseMockRole(url.searchParams.get("role"));
				const user = await createMockSession(role);
				const target = hasAppAccess(user.capabilities) ? "/" : "/no-access";
				return redirectResponse(
					new URL(target, serverConfig.appUrl).toString(),
				);
			},
		},
	},
});
