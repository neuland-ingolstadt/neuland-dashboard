import { createServerFn } from "@tanstack/react-start";
import { requireAccessToken, requireCapability } from "#/lib/auth.server";
import {
	createSportsEvent,
	deleteSportsEvent,
	getSportsEvent,
	getSportsEvents,
	updateSportsEvent,
} from "#/lib/graphql.server";
import {
	type NewSportsEvent,
	newSportsEventSchema,
	type SportsEvent,
} from "#/lib/schemas/sports";

export const listSportsFn = createServerFn({ method: "GET" }).handler(
	async (): Promise<SportsEvent[]> => {
		await requireCapability("sports");
		return getSportsEvents();
	},
);

export const getSportFn = createServerFn({ method: "GET" })
	.validator((data: { id: string }) => {
		if (!data?.id || typeof data.id !== "string") {
			throw new Error("invalid_id");
		}
		return { id: data.id };
	})
	.handler(async ({ data }): Promise<SportsEvent> => {
		await requireCapability("sports");
		return getSportsEvent(data.id);
	});

export const createSportFn = createServerFn({ method: "POST" })
	.validator((data: NewSportsEvent) => newSportsEventSchema.parse(data))
	.handler(async ({ data }) => {
		const { accessToken } = await requireAccessToken({ asJson: true });
		await requireCapability("sports", { asJson: true });
		await createSportsEvent(data, accessToken);
		return { ok: true as const };
	});

export const updateSportFn = createServerFn({ method: "POST" })
	.validator((data: NewSportsEvent & { id: string }) => {
		const { id, ...rest } = data;
		if (!id || typeof id !== "string") {
			throw new Error("invalid_id");
		}
		return { id, event: newSportsEventSchema.parse(rest) };
	})
	.handler(async ({ data }) => {
		const { accessToken } = await requireAccessToken({ asJson: true });
		await requireCapability("sports", { asJson: true });
		await updateSportsEvent(data.event, data.id, accessToken);
		return { ok: true as const };
	});

export const deleteSportFn = createServerFn({ method: "POST" })
	.validator((data: { id: string }) => {
		if (!data?.id || typeof data.id !== "string") {
			throw new Error("invalid_id");
		}
		return { id: data.id };
	})
	.handler(async ({ data }) => {
		const { accessToken } = await requireAccessToken({ asJson: true });
		await requireCapability("sports", { asJson: true });
		await deleteSportsEvent(data.id, accessToken);
		return { ok: true as const };
	});
