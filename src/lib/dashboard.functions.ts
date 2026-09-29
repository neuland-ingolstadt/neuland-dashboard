import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
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
import type { Weekday } from "#/lib/utils";
import { weekdays } from "#/lib/utils";

const QUEUE_LIMIT = 5;
const SPORTS_PREVIEW_LIMIT = 8;

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

export type DashboardSportsItem = {
	id: string;
	title: string;
	campus: "Ingolstadt" | "Neuburg";
	weekday: Weekday;
	startTime: string;
	endTime: string | null;
	location: string;
	updatedAt: string;
};

export type DashboardSummary = {
	sports: {
		total: number;
		byCampus: { Ingolstadt: number; Neuburg: number };
		recent: DashboardSportsItem[];
		lastUpdated: string | null;
	} | null;
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

function weekdayOrder(weekday: Weekday): number {
	return weekdays[weekday]?.order ?? 99;
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
				throw redirect({ to: "/login" });
			}
		}

		const [sports, announcements, reportsResult] = await Promise.all([
			canAccessSports(caps) ? getSportsEvents() : Promise.resolve(null),
			canAccessAnnouncements(caps) ? getAnnouncements() : Promise.resolve(null),
			canAccessReports(caps) && accessToken
				? getRoomReports(accessToken)
						.then((data) => ({ ok: true as const, data }))
						.catch(() => ({ ok: false as const, data: null }))
				: Promise.resolve(null),
		]);

		const reports =
			reportsResult === null
				? null
				: reportsResult.ok
					? reportsResult.data
					: [];

		if (sports) {
			const byCampus = { Ingolstadt: 0, Neuburg: 0 };
			let lastUpdated: string | null = null;

			for (const event of sports) {
				if (event.campus === "Ingolstadt" || event.campus === "Neuburg") {
					byCampus[event.campus] += 1;
				}
				if (
					!lastUpdated ||
					new Date(event.updatedAt).getTime() > new Date(lastUpdated).getTime()
				) {
					lastUpdated = event.updatedAt;
				}
			}

			const recent = [...sports]
				.sort((a, b) => {
					const day = weekdayOrder(a.weekday) - weekdayOrder(b.weekday);
					if (day !== 0) return day;
					return a.startTime.localeCompare(b.startTime);
				})
				.slice(0, SPORTS_PREVIEW_LIMIT)
				.map((event) => ({
					id: event.id,
					title: event.title.de,
					campus: event.campus,
					weekday: event.weekday,
					startTime: event.startTime,
					endTime: event.endTime ?? null,
					location: event.location,
					updatedAt: event.updatedAt,
				}));

			summary.sports = {
				total: sports.length,
				byCampus,
				recent,
				lastUpdated,
			};
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
