import {
	Activity,
	BarChart3,
	CalendarDays,
	DoorOpen,
	Dumbbell,
	Home,
	type LucideIcon,
	Megaphone,
	ScrollText,
} from "lucide-react";
import {
	type AppCapability,
	canAccessAnnouncements,
	canAccessAudit,
	canAccessOps,
	canAccessReports,
	canAccessSports,
} from "#/lib/auth";
import { EXTERNAL_LINKS, ROUTES } from "#/lib/constants";

export type NavItem = {
	to: string;
	label: string;
	icon: LucideIcon;
	match: (pathname: string) => boolean;
	visible: (capabilities: AppCapability[]) => boolean;
	external?: boolean;
};

export const overviewItems: NavItem[] = [
	{
		to: ROUTES.HOME,
		label: "Übersicht",
		icon: Home,
		match: (pathname) => pathname === ROUTES.HOME,
		visible: () => true,
	},
];

export const featureItems: NavItem[] = [
	{
		to: ROUTES.SPORTS,
		label: "Hochschulsport",
		icon: Dumbbell,
		match: (pathname) => pathname.startsWith(ROUTES.SPORTS),
		visible: canAccessSports,
	},
	{
		to: ROUTES.ANNOUNCEMENTS,
		label: "Ankündigungen",
		icon: Megaphone,
		match: (pathname) => pathname.startsWith(ROUTES.ANNOUNCEMENTS),
		visible: canAccessAnnouncements,
	},
	{
		to: EXTERNAL_LINKS.CAMPUS_LIFE,
		label: "Campus Life Events",
		icon: CalendarDays,
		match: () => false,
		visible: canAccessAnnouncements,
		external: true,
	},
	{
		to: ROUTES.ROOM_REPORTS,
		label: "Raum-Meldungen",
		icon: DoorOpen,
		match: (pathname) => pathname.startsWith(ROUTES.ROOM_REPORTS),
		visible: canAccessReports,
	},
];

export const bottomNavItems: NavItem[] = [
	{
		to: ROUTES.AUDIT_LOG,
		label: "Audit-Log",
		icon: ScrollText,
		match: (pathname) => pathname.startsWith(ROUTES.AUDIT_LOG),
		visible: canAccessAudit,
	},
];

export const externalAdminLinks: NavItem[] = [
	{
		to: EXTERNAL_LINKS.ANALYTICS,
		label: "Analytics",
		icon: BarChart3,
		match: () => false,
		visible: canAccessOps,
		external: true,
	},
	{
		to: EXTERNAL_LINKS.STATUS,
		label: "Status",
		icon: Activity,
		match: () => false,
		visible: canAccessOps,
		external: true,
	},
];

export function navItemsForCapabilities(
	items: NavItem[],
	capabilities: AppCapability[],
): NavItem[] {
	return items.filter((item) => item.visible(capabilities));
}
