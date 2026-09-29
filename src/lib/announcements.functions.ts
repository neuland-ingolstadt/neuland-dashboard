import { createServerFn } from "@tanstack/react-start";
import { requireAccessToken, requireCapability } from "#/lib/auth.server";
import {
	createAnnouncement,
	deleteAnnouncement,
	getAnnouncement,
	getAnnouncements,
	updateAnnouncement,
} from "#/lib/graphql.server";
import {
	type Announcement,
	type NewAnnouncement,
	newAnnouncementSchema,
} from "#/lib/schemas/announcements";

function toGraphqlAnnouncement(data: NewAnnouncement) {
	return {
		...data,
		startDateTime:
			data.startDateTime instanceof Date
				? data.startDateTime.toISOString()
				: data.startDateTime,
		endDateTime:
			data.endDateTime instanceof Date
				? data.endDateTime.toISOString()
				: data.endDateTime,
		url: data.url || null,
		imageUrl: data.imageUrl || null,
	};
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
		return getAnnouncement(data.id);
	});

export const createAnnouncementFn = createServerFn({ method: "POST" })
	.validator((data: NewAnnouncement) => newAnnouncementSchema.parse(data))
	.handler(async ({ data }) => {
		const { accessToken } = await requireAccessToken({ asJson: true });
		await requireCapability("announcements", { asJson: true });
		await createAnnouncement(toGraphqlAnnouncement(data), accessToken);
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
		await updateAnnouncement(
			toGraphqlAnnouncement(data.announcement),
			data.id,
			accessToken,
		);
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
		await deleteAnnouncement(data.id, accessToken);
		return { ok: true as const };
	});
