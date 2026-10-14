import type { components } from "@neuland-ingolstadt/backend-core-api";
import { createServerFn } from "@tanstack/react-start";
import { requireAccessToken, requireCapability } from "#/lib/auth.server";
import { coreApiClient } from "#/lib/core-api.server";
import type { RoomReport } from "#/lib/schemas/room-reports";

function toCoreRoomReportId(id: string): number {
	const roomReportId = Number(id);
	if (!Number.isSafeInteger(roomReportId)) {
		throw new Error("invalid_id");
	}
	return roomReportId;
}

function toDashboardRoomReport(
	report: components["schemas"]["RoomReport"],
): RoomReport {
	return {
		id: String(report.id),
		description: report.description ?? "",
		reason: report.reason,
		resolvedAt: report.resolvedAt ?? null,
		room: report.room,
	};
}

export async function getRoomReports(
	accessToken: string,
): Promise<RoomReport[]> {
	const { data, error } = await coreApiClient.GET("/room-reports", {
		headers: { Authorization: `Bearer ${accessToken}` },
	});
	if (error || !data) {
		throw new Error("Raummeldungen konnten nicht geladen werden.");
	}
	return data.roomReports.map(toDashboardRoomReport);
}

export const listRoomReportsFn = createServerFn({ method: "GET" }).handler(
	async (): Promise<RoomReport[]> => {
		const { accessToken } = await requireAccessToken();
		await requireCapability("reports");
		return getRoomReports(accessToken);
	},
);

export const resolveRoomReportFn = createServerFn({ method: "POST" })
	.validator((data: { id: string }) => {
		if (!data?.id || typeof data.id !== "string") {
			throw new Error("invalid_id");
		}
		return { id: data.id };
	})
	.handler(async ({ data }) => {
		const { accessToken } = await requireAccessToken({ asJson: true });
		await requireCapability("reports", { asJson: true });
		const { error } = await coreApiClient.PATCH(
			"/room-reports/{roomReportId}",
			{
				params: {
					path: {
						roomReportId: toCoreRoomReportId(data.id),
					},
				},
				headers: { Authorization: `Bearer ${accessToken}` },
				body: { resolved: true },
			},
		);
		if (error) {
			throw new Error("Raummeldung konnte nicht erledigt werden.");
		}
		return { ok: true as const };
	});
