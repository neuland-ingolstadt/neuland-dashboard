import type { components } from "@neuland-ingolstadt/backend-core-api";
import { createServerFn } from "@tanstack/react-start";
import { requireAccessToken, requireCapability } from "#/lib/auth.server";
import { getCoreApiClient } from "#/lib/core-api";
import {
	type NewSportsEvent,
	newSportsEventSchema,
	type SportsEvent,
} from "#/lib/schemas/sports";
import { formatTime } from "#/lib/utils";

const campusByCoreValue = {
	INGOLSTADT: "Ingolstadt",
	NEUBURG: "Neuburg",
} as const satisfies Record<
	components["schemas"]["CampusEnum"],
	SportsEvent["campus"]
>;

const sportsCategoryByCoreValue = {
	BASKETBALL: "Basketball",
	FOOTBALL: "Soccer",
	CALISTHENICS: "Calisthenics",
	VOLLEYBALL: "Volleyball",
	HANDBALL: "Handball",
	BOULDERING: "Climbing",
	BADMINTON: "Badminton",
	TENNIS: "Tennis",
	SWIMMING: "Swimming",
	MARTIAL_ARTS: "MartialArts",
	YOGA: "Yoga",
	DANCING: "Dancing",
	STRENGTH_TRAINING: "StrengthTraining",
	RUNNING: "Running",
	JOGGING: "Jogging",
	FRISBEE: "Frisbee",
	SPIKEBALL: "Spikeball",
	FULL_BODY_WORKOUT: "FullBodyWorkout",
	DEFENSE: "Defense",
	MEDITATION: "Meditation",
	WATERPOLO: "Waterpolo",
	CYCLING: "Cycling",
	BOXING: "Boxing",
	KICKBOXING: "Kickboxing",
	TABLE_TENNIS: "TableTennis",
	ROWING: "Rowing",
	BASEBALL: "Baseball",
	SKATEBOARDING: "Skateboarding",
	PARKOUR: "Parkour",
	HOCKEY: "Hockey",
	HIKING: "Hiking",
	OTHER: "Other",
} as const satisfies Record<
	components["schemas"]["SportsCategoryEnum"],
	SportsEvent["sportsCategory"]
>;

const weekdayByCoreValue = {
	MONDAY: "Monday",
	TUESDAY: "Tuesday",
	WEDNESDAY: "Wednesday",
	THURSDAY: "Thursday",
	FRIDAY: "Friday",
	SATURDAY: "Saturday",
	SUNDAY: "Sunday",
} as const satisfies Record<
	components["schemas"]["WeekdayEnum"],
	SportsEvent["weekday"]
>;

const coreCampusByValue = {
	Ingolstadt: "INGOLSTADT",
	Neuburg: "NEUBURG",
} as const satisfies Record<
	NewSportsEvent["campus"],
	components["schemas"]["CampusEnum"]
>;

const coreWeekdayByValue = {
	Monday: "MONDAY",
	Tuesday: "TUESDAY",
	Wednesday: "WEDNESDAY",
	Thursday: "THURSDAY",
	Friday: "FRIDAY",
	Saturday: "SATURDAY",
	Sunday: "SUNDAY",
} as const satisfies Record<
	NewSportsEvent["weekday"],
	components["schemas"]["WeekdayEnum"]
>;

const coreSportsCategoryByValue = {
	Badminton: "BADMINTON",
	Baseball: "BASEBALL",
	Basketball: "BASKETBALL",
	Boxing: "BOXING",
	Calisthenics: "CALISTHENICS",
	MartialArts: "MARTIAL_ARTS",
	Running: "RUNNING",
	Dancing: "DANCING",
	Defense: "DEFENSE",
	Frisbee: "FRISBEE",
	FullBodyWorkout: "FULL_BODY_WORKOUT",
	Handball: "HANDBALL",
	Hockey: "HOCKEY",
	Jogging: "JOGGING",
	Kickboxing: "KICKBOXING",
	Climbing: "BOULDERING",
	StrengthTraining: "STRENGTH_TRAINING",
	Meditation: "MEDITATION",
	Cycling: "CYCLING",
	Parkour: "PARKOUR",
	Rowing: "ROWING",
	Skateboarding: "SKATEBOARDING",
	Soccer: "FOOTBALL",
	Spikeball: "SPIKEBALL",
	Swimming: "SWIMMING",
	TableTennis: "TABLE_TENNIS",
	Tennis: "TENNIS",
	Volleyball: "VOLLEYBALL",
	Hiking: "HIKING",
	Waterpolo: "WATERPOLO",
	Yoga: "YOGA",
	Other: "OTHER",
} as const satisfies Record<
	NewSportsEvent["sportsCategory"],
	components["schemas"]["SportsCategoryEnum"]
>;

function toCoreTime(value: string | null | undefined): string | null {
	if (!value) return null;
	const time = formatTime(value);
	return time ? `${time}:00Z` : null;
}

function toCoreSportsId(id: string): number {
	const sportsId = Number(id);
	if (!Number.isSafeInteger(sportsId)) {
		throw new Error("invalid_id");
	}
	return sportsId;
}

function toCoreSportsCategory(
	value: string,
): components["schemas"]["SportsCategoryEnum"] {
	if (!Object.hasOwn(coreSportsCategoryByValue, value)) {
		throw new Error("Ungültige Sportkategorie.");
	}
	return coreSportsCategoryByValue[
		value as keyof typeof coreSportsCategoryByValue
	];
}

function toCoreSportsWrite(
	event: NewSportsEvent,
): components["schemas"]["SportsCreateRequest"] {
	const startTime = toCoreTime(event.startTime);
	if (!startTime) {
		throw new Error("Bitte eine Startzeit angeben.");
	}

	return {
		contents: {
			de: {
				title: event.title.de,
				description: event.description.de?.trim() || null,
			},
			en: {
				title: event.title.en,
				description: event.description.en?.trim() || null,
			},
		},
		campus: coreCampusByValue[event.campus],
		location: event.location.trim(),
		weekday: coreWeekdayByValue[event.weekday],
		startTime,
		endTime: toCoreTime(event.endTime),
		requiresRegistration: event.requiresRegistration,
		invitationLink: event.invitationLink || null,
		email: event.eMail || null,
		sportsCategory: toCoreSportsCategory(event.sportsCategory),
	};
}

function toDashboardSportsEvent(
	sport: components["schemas"]["Sports"],
): SportsEvent {
	return {
		id: String(sport.id),
		title: {
			de: sport.contents.de.title,
			en: sport.contents.en.title,
		},
		description: {
			de: sport.contents.de.description ?? undefined,
			en: sport.contents.en.description ?? undefined,
		},
		campus: campusByCoreValue[sport.campus],
		location: sport.location,
		weekday: weekdayByCoreValue[sport.weekday],
		startTime: formatTime(sport.startTime),
		endTime: sport.endTime ? formatTime(sport.endTime) : null,
		requiresRegistration: sport.requiresRegistration,
		invitationLink: sport.invitationLink ?? null,
		eMail: sport.email ?? null,
		sportsCategory: sportsCategoryByCoreValue[sport.sportsCategory],
	};
}

export async function getSportsEvents(): Promise<SportsEvent[]> {
	const coreApiClient = await getCoreApiClient();
	const { data, error } = await coreApiClient.GET("/university-sports");

	if (error || !data) {
		throw new Error("Failed to fetch sports events");
	}

	return data.sports.map(toDashboardSportsEvent);
}

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
		const coreApiClient = await getCoreApiClient();
		const { data: sport, error } = await coreApiClient.GET(
			"/university-sports/{sportsId}",
			{
				params: {
					path: {
						sportsId: toCoreSportsId(data.id),
					},
				},
			},
		);

		if (error || !sport) {
			throw new Error("Sportveranstaltung nicht gefunden");
		}

		return toDashboardSportsEvent(sport);
	});

export const createSportFn = createServerFn({ method: "POST" })
	.validator((data: NewSportsEvent) => newSportsEventSchema.parse(data))
	.handler(async ({ data }) => {
		const { accessToken } = await requireAccessToken({ asJson: true });
		await requireCapability("sports", { asJson: true });
		const coreApiClient = await getCoreApiClient();
		const { error } = await coreApiClient.POST("/university-sports", {
			headers: { Authorization: `Bearer ${accessToken}` },
			body: toCoreSportsWrite(data),
		});
		if (error) {
			throw new Error("Sportveranstaltung konnte nicht erstellt werden.");
		}
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
		const coreApiClient = await getCoreApiClient();
		const { error } = await coreApiClient.PATCH(
			"/university-sports/{sportsId}",
			{
				params: {
					path: {
						sportsId: toCoreSportsId(data.id),
					},
				},
				headers: { Authorization: `Bearer ${accessToken}` },
				// `minProperties` in the Core contract is currently generated as
				// `SportsWrite & Record<string, never>`, although the API accepts SportsWrite.
				body: toCoreSportsWrite(data.event) as never,
			},
		);
		if (error) {
			throw new Error("Sportveranstaltung konnte nicht aktualisiert werden.");
		}
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
		const coreApiClient = await getCoreApiClient();
		const { error } = await coreApiClient.DELETE(
			"/university-sports/{sportsId}",
			{
				params: {
					path: {
						sportsId: toCoreSportsId(data.id),
					},
				},
				headers: { Authorization: `Bearer ${accessToken}` },
			},
		);
		if (error) {
			throw new Error("Sportveranstaltung konnte nicht gelöscht werden.");
		}
		return { ok: true as const };
	});
