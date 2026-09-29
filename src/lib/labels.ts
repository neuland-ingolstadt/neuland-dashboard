import type { Announcement } from "#/lib/schemas/announcements";
import type { RoomReport } from "#/lib/schemas/room-reports";

export const PLATFORM_OPTIONS = [
	{ value: "ANDROID" as const, label: "Android" },
	{ value: "IOS" as const, label: "iOS" },
	{ value: "WEB" as const, label: "Web" },
	{ value: "WEB_DEV" as const, label: "Web Dev" },
];

export const USER_KIND_OPTIONS = [
	{ value: "STUDENT" as const, label: "Student" },
	{ value: "EMPLOYEE" as const, label: "Mitarbeiter" },
	{ value: "GUEST" as const, label: "Gast" },
];

const PLATFORM_LABELS: Record<Announcement["platform"][number], string> =
	Object.fromEntries(PLATFORM_OPTIONS.map((o) => [o.value, o.label])) as Record<
		Announcement["platform"][number],
		string
	>;

const USER_KIND_LABELS: Record<Announcement["userKind"][number], string> =
	Object.fromEntries(
		USER_KIND_OPTIONS.map((o) => [o.value, o.label]),
	) as Record<Announcement["userKind"][number], string>;

export const ROOM_REASON_LABELS: Record<RoomReport["reason"], string> = {
	WRONG_DESCRIPTION: "Falsche Beschreibung",
	WRONG_LOCATION: "Falscher Standort",
	NOT_EXISTING: "Existiert nicht",
	MISSING: "Fehlt",
	OTHER: "Sonstiges",
};

export function platformLabel(
	value: Announcement["platform"][number] | string,
): string {
	return PLATFORM_LABELS[value as Announcement["platform"][number]] ?? value;
}

export function userKindLabel(
	value: Announcement["userKind"][number] | string,
): string {
	return USER_KIND_LABELS[value as Announcement["userKind"][number]] ?? value;
}

export function roomReasonLabel(value: RoomReport["reason"] | string): string {
	return ROOM_REASON_LABELS[value as RoomReport["reason"]] ?? value;
}

/** Title-case snake/SCREAMING enums: CREATE_ENTITY → Create entity */
export function formatEnumLabel(value: string): string {
	if (!value) return value;
	return value
		.toLowerCase()
		.split(/[_\s]+/)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(" ");
}
