import { createServerFn } from "@tanstack/react-start";
import { setResponseStatus } from "@tanstack/react-start/server";
import {
	type AnnouncementStatus,
	getAnnouncementStatus,
} from "#/lib/announcement-status";
import {
	canAccessAnnouncements,
	canAccessReports,
	canAccessSports,
} from "#/lib/auth";
import { getAccessToken, requireAppAccess } from "#/lib/auth.server";
import {
	getAnnouncements,
	getRoomReports,
	getSportsEvents,
} from "#/lib/graphql.server";
import type { RoomReport } from "#/lib/schemas/room-reports";

const QUEUE_LIMIT = 5;

export type DashboardAnnouncementItem = {
	id: string;
	title: string;
	status: AnnouncementStatus;
};

export type DashboardReportItem = {
	id: string;
	room: string;
	reason: RoomReport["reason"];
	createdAt: string;
};

export type DashboardSummary = {
	sports: { total: number } | null;
	announcements: {
		active: number;
		upcoming: number;
		recent: DashboardAnnouncementItem[];
	} | null;
	reports: {
		open: number;
		recentOpen: DashboardReportItem[];
	} | null;
};

function emptySummary(): DashboardSummary {
	return {
		sports: null,
		announcements: null,
		reports: null,
	};
}

export const getDashboardSummaryFn = createServerFn({ method: "GET" }).handler(
	async (): Promise<DashboardSummary> => {
		const user = await requireAppAccess();
		const caps = user.capabilities;
		const summary = emptySummary();

		let accessToken: string | null = null;
		if (canAccessReports(caps)) {
			accessToken = await getAccessToken();
			if (!accessToken) {
				setResponseStatus(401);
				throw new Error("Sitzung abgelaufen");
			}
		}

		const [sports, announcements, reports] = await Promise.all([
			canAccessSports(caps) ? getSportsEvents() : Promise.resolve(null),
			canAccessAnnouncements(caps) ? getAnnouncements() : Promise.resolve(null),
			canAccessReports(caps) && accessToken
				? getRoomReports(accessToken)
				: Promise.resolve(null),
		]);

		if (sports) {
			summary.sports = { total: sports.length };
		}

		if (announcements) {
			const withStatus = announcements.map((a) => ({
				id: a.id,
				title: a.title.de,
				status: getAnnouncementStatus(a),
				startDateTime: a.startDateTime,
			}));
			const active = withStatus.filter((a) => a.status === "active");
			const upcoming = withStatus.filter((a) => a.status === "upcoming");
			const attention = [...active, ...upcoming]
				.sort(
					(a, b) =>
						new Date(a.startDateTime).getTime() -
						new Date(b.startDateTime).getTime(),
				)
				.slice(0, QUEUE_LIMIT)
				.map(({ id, title, status }) => ({ id, title, status }));

			summary.announcements = {
				active: active.length,
				upcoming: upcoming.length,
				recent: attention,
			};
		}

		if (reports) {
			const open = reports.filter((r) => r.resolvedAt === null);
			const recentOpen = [...open]
				.sort(
					(a, b) =>
						new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
				)
				.slice(0, QUEUE_LIMIT)
				.map(({ id, room, reason, createdAt }) => ({
					id,
					room,
					reason,
					createdAt,
				}));

			summary.reports = {
				open: open.length,
				recentOpen,
			};
		}

		return summary;
	},
);
