import type { LucideIcon } from "lucide-react";
import { CheckCircle2, CircleX, Clock } from "lucide-react";

export const announcementStatus = {
	active: "Aktiv",
	upcoming: "Anstehend",
	past: "Abgelaufen",
} as const;

export type AnnouncementStatus = keyof typeof announcementStatus;

export function getAnnouncementStatus(announcement: {
	startDateTime: Date | string;
	endDateTime: Date | string;
}): AnnouncementStatus {
	const startDate = new Date(announcement.startDateTime);
	const endDate = new Date(announcement.endDateTime);
	const now = new Date();

	if (now < startDate) return "upcoming";
	if (now > endDate) return "past";
	return "active";
}

const statusMeta: Record<
	AnnouncementStatus,
	{ icon: LucideIcon; className: string }
> = {
	active: {
		icon: CheckCircle2,
		className: "text-emerald-600 dark:text-emerald-400",
	},
	upcoming: {
		icon: Clock,
		className: "text-amber-600 dark:text-amber-400",
	},
	past: {
		icon: CircleX,
		className: "text-rose-500/80 dark:text-rose-400/80",
	},
};

export function getAnnouncementStatusMeta(status: AnnouncementStatus) {
	return statusMeta[status];
}
