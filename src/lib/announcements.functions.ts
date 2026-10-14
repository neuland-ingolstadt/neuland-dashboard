import type { components } from "@neuland-ingolstadt/backend-core-api";
import { createServerFn } from "@tanstack/react-start";
import { requireAccessToken, requireCapability } from "#/lib/auth.server";
import { getCoreApiClient } from "#/lib/core-api";
import {
	type Announcement,
	type NewAnnouncement,
	newAnnouncementSchema,
} from "#/lib/schemas/announcements";

function toCoreAnnouncementId(id: string): number {
	const announcementId = Number(id);
	if (!Number.isSafeInteger(announcementId)) {
		throw new Error("invalid_id");
	}
	return announcementId;
}

function toCoreAnnouncement(
	data: NewAnnouncement,
): components["schemas"]["AnnouncementCreateRequest"] {
	return {
		platforms: data.platform,
		userKinds: data.userKind,
		contents: {
			de: {
				title: data.title.de,
				description: data.description.de,
			},
			en: {
				title: data.title.en,
				description: data.description.en,
			},
		},
		startDateTime: data.startDateTime.toISOString(),
		endDateTime: data.endDateTime.toISOString(),
		priority: data.priority,
		url: data.url || null,
		imageUrl: data.imageUrl || null,
	};
}

function toDashboardAnnouncement(
	announcement: components["schemas"]["Announcement"],
): Announcement {
	return {
		id: String(announcement.id),
		title: {
			de: announcement.contents.de.title,
			en: announcement.contents.en.title,
		},
		description: {
			de: announcement.contents.de.description,
			en: announcement.contents.en.description,
		},
		startDateTime: new Date(announcement.startDateTime),
		endDateTime: new Date(announcement.endDateTime),
		priority: announcement.priority,
		url: announcement.url ?? null,
		platform: announcement.platforms,
		userKind: announcement.userKinds,
		imageUrl: announcement.imageUrl ?? null,
	};
}

export async function getAnnouncements(): Promise<Announcement[]> {
	const coreApiClient = await getCoreApiClient();
	const { data, error } = await coreApiClient.GET("/announcements", {
		params: {
			query: {
				includeInactive: true,
			},
		},
	});
	if (error || !data) {
		throw new Error("Ankündigungen konnten nicht geladen werden.");
	}
	return data.announcements.map(toDashboardAnnouncement);
}

export const listAnnouncementsFn = createServerFn({ method: "GET" }).handler(
	async (): Promise<Announcement[]> => {
		await requireCapability("announcements");
		return getAnnouncements();
	},
);

export const getAnnouncementFn = createServerFn({ method: "GET" })
	.validator((data: { id: string }) => {
		if (!data?.id || typeof data.id !== "string") {
			throw new Error("invalid_id");
		}
		return { id: data.id };
	})
	.handler(async ({ data }): Promise<Announcement> => {
		await requireCapability("announcements");
		const coreApiClient = await getCoreApiClient();
		const { data: announcement, error } = await coreApiClient.GET(
			"/announcements/{announcementId}",
			{
				params: {
					path: {
						announcementId: toCoreAnnouncementId(data.id),
					},
				},
			},
		);
		if (error || !announcement) {
			throw new Error("Ankündigung nicht gefunden");
		}
		return toDashboardAnnouncement(announcement);
	});

export const createAnnouncementFn = createServerFn({ method: "POST" })
	.validator((data: NewAnnouncement) => newAnnouncementSchema.parse(data))
	.handler(async ({ data }) => {
		const { accessToken } = await requireAccessToken({ asJson: true });
		await requireCapability("announcements", { asJson: true });
		const coreApiClient = await getCoreApiClient();
		const { error } = await coreApiClient.POST("/announcements", {
			headers: { Authorization: `Bearer ${accessToken}` },
			body: toCoreAnnouncement(data),
		});
		if (error) {
			throw new Error("Ankündigung konnte nicht erstellt werden.");
		}
		return { ok: true as const };
	});

export const updateAnnouncementFn = createServerFn({ method: "POST" })
	.validator((data: NewAnnouncement & { id: string }) => {
		const { id, ...rest } = data;
		if (!id || typeof id !== "string") {
			throw new Error("invalid_id");
		}
		return { id, announcement: newAnnouncementSchema.parse(rest) };
	})
	.handler(async ({ data }) => {
		const { accessToken } = await requireAccessToken({ asJson: true });
		await requireCapability("announcements", { asJson: true });
		const coreApiClient = await getCoreApiClient();
		const { error } = await coreApiClient.PATCH(
			"/announcements/{announcementId}",
			{
				params: {
					path: {
						announcementId: toCoreAnnouncementId(data.id),
					},
				},
				headers: { Authorization: `Bearer ${accessToken}` },
				body: toCoreAnnouncement(data.announcement),
			},
		);
		if (error) {
			throw new Error("Ankündigung konnte nicht aktualisiert werden.");
		}
		return { ok: true as const };
	});

export const deleteAnnouncementFn = createServerFn({ method: "POST" })
	.validator((data: { id: string }) => {
		if (!data?.id || typeof data.id !== "string") {
			throw new Error("invalid_id");
		}
		return { id: data.id };
	})
	.handler(async ({ data }) => {
		const { accessToken } = await requireAccessToken({ asJson: true });
		await requireCapability("announcements", { asJson: true });
		const coreApiClient = await getCoreApiClient();
		const { error } = await coreApiClient.DELETE(
			"/announcements/{announcementId}",
			{
				params: {
					path: {
						announcementId: toCoreAnnouncementId(data.id),
					},
				},
				headers: { Authorization: `Bearer ${accessToken}` },
			},
		);
		if (error) {
			throw new Error("Ankündigung konnte nicht gelöscht werden.");
		}
		return { ok: true as const };
	});
