import { createServerFn } from "@tanstack/react-start";
import { requireAccessToken, requireCapability } from "#/lib/auth.server";
import { getRoomReports, resolveRoomReport } from "#/lib/graphql.server";
import type { RoomReport } from "#/lib/schemas/room-reports";

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
		await resolveRoomReport(data.id, accessToken);
		return { ok: true as const };
	});
