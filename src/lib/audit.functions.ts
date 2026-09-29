import { createServerFn } from "@tanstack/react-start";
import { requireAccessToken, requireCapability } from "#/lib/auth.server";
import { getAuditLog } from "#/lib/graphql.server";
import type { AuditLogEntry } from "#/lib/schemas/audit-log";

export const listAuditLogFn = createServerFn({ method: "GET" })
	.validator((data?: { limit?: number; offset?: number }) => {
		const limit =
			typeof data?.limit === "number" && Number.isFinite(data.limit)
				? data.limit
				: 100;
		const offset =
			typeof data?.offset === "number" && Number.isFinite(data.offset)
				? data.offset
				: 0;
		return { limit, offset };
	})
	.handler(async ({ data }): Promise<AuditLogEntry[]> => {
		const { accessToken } = await requireAccessToken();
		await requireCapability("audit");
		return getAuditLog(accessToken, data.limit, data.offset);
	});
