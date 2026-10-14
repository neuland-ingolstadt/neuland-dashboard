import type { components } from "@neuland-ingolstadt/backend-core-api";
import { createServerFn } from "@tanstack/react-start";
import { requireAccessToken, requireCapability } from "#/lib/auth.server";
import { coreApiClient } from "#/lib/core-api.server";
import type { AuditLogEntry } from "#/lib/schemas/audit-log";

const auditOperationByCoreValue = {
	CREATE: "insert",
	UPDATE: "update",
	DELETE: "delete",
} as const satisfies Record<
	components["schemas"]["AuditLogOperationEnum"],
	AuditLogEntry["operation"]
>;

function toDashboardAuditLogEntry(
	entry: components["schemas"]["AuditLogEntry"],
): AuditLogEntry {
	return {
		id: String(entry.id),
		entity: entry.entity,
		entityId:
			entry.entityId === null || entry.entityId === undefined
				? "Unbekannt"
				: String(entry.entityId),
		operation: auditOperationByCoreValue[entry.operation],
		name: entry.name ?? "Unbekannt",
		userId: entry.userId ?? "Unbekannt",
		createdAt: entry.createdAt,
	};
}

export const listAuditLogFn = createServerFn({ method: "GET" })
	.validator((data?: { limit?: number; cursor?: string }) => {
		const limit =
			typeof data?.limit === "number" && Number.isFinite(data.limit)
				? data.limit
				: 100;
		const cursor =
			typeof data?.cursor === "string" && data.cursor.length > 0
				? data.cursor
				: undefined;
		return { limit, cursor };
	})
	.handler(async ({ data }): Promise<AuditLogEntry[]> => {
		const { accessToken } = await requireAccessToken();
		await requireCapability("audit");
		const { data: auditLog, error } = await coreApiClient.GET("/audit-logs", {
			params: {
				query: {
					limit: data.limit,
					cursor: data.cursor,
				},
			},
			headers: { Authorization: `Bearer ${accessToken}` },
		});
		if (error || !auditLog) {
			throw new Error("Audit-Log konnte nicht geladen werden.");
		}
		return auditLog.auditLogs.map(toDashboardAuditLogEntry);
	});
