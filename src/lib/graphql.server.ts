import { GraphQLClient, gql } from "graphql-request";
import { serverConfig } from "#/lib/config";
import type {
	Announcement,
	NewAnnouncement,
} from "#/lib/schemas/announcements";
import type { AuditLogEntry } from "#/lib/schemas/audit-log";
import type { RoomReport } from "#/lib/schemas/room-reports";
import type { NewSportsEvent, SportsEvent } from "#/lib/schemas/sports";
import { formatTime } from "#/lib/utils";

function toTimeWithSeconds(value: string | null | undefined): string | null {
	if (!value) return null;
	const hhmm = formatTime(value);
	if (!hhmm) return null;
	return /^\d{1,2}:\d{2}:\d{2}$/.test(value.trim())
		? value.trim()
		: `${hhmm}:00`;
}

/** Shape GraphQL `UniversitySportsInput` expects (no empty description objects). */
function toUniversitySportsInput(event: NewSportsEvent) {
	const de = event.description?.de?.trim() ?? "";
	const en = event.description?.en?.trim() ?? "";
	const hasDescription = Boolean(de && en);
	const startTime = toTimeWithSeconds(event.startTime);

	if (!startTime) {
		throw new Error("Bitte eine Startzeit angeben.");
	}
	if (!event.location?.trim()) {
		throw new Error("Bitte einen Ort eingeben.");
	}

	return {
		title: event.title,
		description: hasDescription ? { de, en } : null,
		campus: event.campus,
		location: event.location.trim(),
		weekday: event.weekday,
		startTime,
		endTime: toTimeWithSeconds(event.endTime),
		requiresRegistration: event.requiresRegistration,
		invitationLink: event.invitationLink || null,
		eMail: event.eMail || null,
		sportsCategory: event.sportsCategory,
	};
}

async function requestGraphql<T>(
	client: GraphQLClient,
	document: string,
	variables?: Record<string, unknown>,
	headers?: HeadersInit,
): Promise<T> {
	try {
		return await client.request<T>(document, variables, headers);
	} catch (err) {
		const message =
			err && typeof err === "object" && "response" in err
				? (err as { response?: { errors?: Array<{ message?: string }> } })
						.response?.errors?.[0]?.message
				: undefined;
		if (typeof message === "string") throw new Error(message);
		if (err instanceof Error)
			throw new Error(err.message.split(/:\s*\{/)[0] || err.message);
		throw err;
	}
}

const endpoint = serverConfig.graphql.url;
const devEndpoint = serverConfig.graphql.devUrl || endpoint;

export const prodGraphqlClient = new GraphQLClient(endpoint);
export const devGraphqlClient = new GraphQLClient(devEndpoint);

const graphqlClient = {
	sports: prodGraphqlClient,
	roomReports: prodGraphqlClient,
	appAnnouncements: prodGraphqlClient,
	auditLog: devGraphqlClient,
};

interface SportsEventData {
	universitySports: SportsEvent[];
	error?: unknown;
}

interface AnnouncementsData {
	appAnnouncements: Announcement[];
	error?: unknown;
}

interface RoomReportsData {
	roomReports: RoomReport[];
	error?: unknown;
}

interface AuditLogData {
	auditLog: AuditLogEntry[];
	error?: unknown;
}

export async function getSportsEvents() {
	const query = gql`
		query {
			universitySports {
				id
				title {
					de
					en
				}
				description {
					de
					en
				}
				campus
				location
				weekday
				startTime
				endTime
				requiresRegistration
				invitationLink
				eMail
				sportsCategory
				createdAt
				updatedAt
			}
		}
	`.replace(/\s+/g, " ");

	const data = await requestGraphql<SportsEventData>(
		graphqlClient.sports,
		query,
	);

	if (!data.universitySports) {
		throw new Error("No data returned from API");
	}

	return data.universitySports;
}

export async function getSportsEvent(id: string) {
	const events = await getSportsEvents();
	const event = events.find((item) => item.id === id);
	if (!event) {
		throw new Error("Sportveranstaltung nicht gefunden");
	}
	return event;
}

export async function createSportsEvent(
	event: NewSportsEvent,
	accessToken: string,
) {
	const mutation = gql`
		mutation UpsertUniversitySport($event: UniversitySportsInput!) {
			upsertUniversitySport(input: $event) {
				id
			}
		}
	`.replace(/\s+/g, " ");

	await requestGraphql(
		graphqlClient.sports,
		mutation,
		{ event: toUniversitySportsInput(event) },
		{ Authorization: `Bearer ${accessToken}` },
	);
}

export async function updateSportsEvent(
	event: NewSportsEvent,
	id: string,
	accessToken: string,
) {
	const mutation = gql`
		mutation UpsertUniversitySport($event: UniversitySportsInput!, $id: ID!) {
			upsertUniversitySport(input: $event, id: $id) {
				id
			}
		}
	`.replace(/\s+/g, " ");

	await requestGraphql(
		graphqlClient.sports,
		mutation,
		{ event: toUniversitySportsInput(event), id },
		{ Authorization: `Bearer ${accessToken}` },
	);
}

export async function deleteSportsEvent(id: string, accessToken: string) {
	const mutation = gql`
		mutation DeleteUniversitySport($id: ID!) {
			deleteUniversitySport(id: $id)
		}
	`.replace(/\s+/g, " ");

	await requestGraphql(
		graphqlClient.sports,
		mutation,
		{ id },
		{ Authorization: `Bearer ${accessToken}` },
	);
}

export async function getRoomReports(accessToken: string) {
	const query = gql`
		query {
			roomReports {
				id
				createdAt
				description
				reason
				resolvedAt
				room
			}
		}
	`.replace(/\s+/g, " ");

	const data = await requestGraphql<RoomReportsData>(
		graphqlClient.roomReports,
		query,
		undefined,
		{
			Authorization: `Bearer ${accessToken}`,
		},
	);

	if (!data.roomReports) {
		throw new Error("No data returned from API");
	}

	return data.roomReports;
}

export async function resolveRoomReport(id: string, accessToken: string) {
	const mutation = gql`
		mutation ResolveRoomReport($id: ID!) {
			resolveRoomReport(id: $id, resolved: true) {
				id
			}
		}
	`.replace(/\s+/g, " ");

	await requestGraphql(
		graphqlClient.roomReports,
		mutation,
		{ id },
		{ Authorization: `Bearer ${accessToken}` },
	);
}

export async function getAnnouncements() {
	const query = gql`
		query {
			appAnnouncements {
				id
				title {
					de
					en
				}
				description {
					de
					en
				}
				startDateTime
				endDateTime
				priority
				url
				createdAt
				updatedAt
				platform
				userKind
				imageUrl
			}
		}
	`.replace(/\s+/g, " ");

	const data = await requestGraphql<AnnouncementsData>(
		graphqlClient.appAnnouncements,
		query,
	);

	if (!data.appAnnouncements) {
		throw new Error("No data returned from API");
	}

	return data.appAnnouncements;
}

export async function getAnnouncement(id: string) {
	const announcements = await getAnnouncements();
	const announcement = announcements.find((item) => item.id === id);
	if (!announcement) {
		throw new Error("Ankündigung nicht gefunden");
	}
	return announcement;
}

/** GraphQL AnnouncementInput accepts ISO date strings. */
export type AnnouncementInput = Omit<
	NewAnnouncement,
	"startDateTime" | "endDateTime"
> & {
	startDateTime: string | Date;
	endDateTime: string | Date;
};

export async function createAnnouncement(
	announcement: AnnouncementInput,
	accessToken: string,
) {
	const mutation = gql`
		mutation UpsertAppAnnouncement($announcement: AnnouncementInput!) {
			upsertAppAnnouncement(input: $announcement) {
				id
			}
		}
	`.replace(/\s+/g, " ");

	await requestGraphql(
		graphqlClient.appAnnouncements,
		mutation,
		{ announcement },
		{ Authorization: `Bearer ${accessToken}` },
	);
}

export async function updateAnnouncement(
	announcement: AnnouncementInput,
	id: string,
	accessToken: string,
) {
	const mutation = gql`
		mutation UpsertAppAnnouncement(
			$announcement: AnnouncementInput!
			$id: ID!
		) {
			upsertAppAnnouncement(input: $announcement, id: $id) {
				id
			}
		}
	`.replace(/\s+/g, " ");

	await requestGraphql(
		graphqlClient.appAnnouncements,
		mutation,
		{ announcement, id },
		{ Authorization: `Bearer ${accessToken}` },
	);
}

export async function deleteAnnouncement(id: string, accessToken: string) {
	const mutation = gql`
		mutation deleteAppAnnouncement($id: ID!) {
			deleteAppAnnouncement(id: $id)
		}
	`.replace(/\s+/g, " ");

	await requestGraphql(
		graphqlClient.appAnnouncements,
		mutation,
		{ id },
		{ Authorization: `Bearer ${accessToken}` },
	);
}

export async function getAuditLog(
	accessToken: string,
	limit?: number,
	offset?: number,
) {
	const query = gql`
		query AuditLog($limit: Int, $offset: Int) {
			auditLog(limit: $limit, offset: $offset) {
				id
				entity
				entityId
				operation
				name
				userId
				createdAt
			}
		}
	`.replace(/\s+/g, " ");

	const data = await requestGraphql<AuditLogData>(
		graphqlClient.auditLog,
		query,
		{ limit, offset },
		{ Authorization: `Bearer ${accessToken}` },
	);

	if (!data.auditLog) {
		throw new Error("No data returned from API");
	}

	return data.auditLog;
}
