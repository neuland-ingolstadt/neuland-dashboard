/** Client-safe auth types and helpers (no secrets / tokens). */

export type AppCapability =
	| "sports"
	| "announcements"
	| "reports"
	| "ops"
	| "audit"
	| "admin";

export type SessionUser = {
	sub: string;
	email: string;
	name: string;
	groups: string[];
	capabilities: AppCapability[];
};

/** Any assigned dashboard role grants login. */
export function hasAppAccess(capabilities: AppCapability[]): boolean {
	return capabilities.length > 0;
}

export function hasCapability(
	capabilities: AppCapability[],
	required: Exclude<AppCapability, "admin">,
): boolean {
	if (capabilities.includes("admin")) return true;
	return capabilities.includes(required);
}

export function canAccessSports(capabilities: AppCapability[]): boolean {
	return hasCapability(capabilities, "sports");
}

export function canAccessAnnouncements(capabilities: AppCapability[]): boolean {
	return hasCapability(capabilities, "announcements");
}

export function canAccessReports(capabilities: AppCapability[]): boolean {
	return hasCapability(capabilities, "reports");
}

export function canAccessOps(capabilities: AppCapability[]): boolean {
	return hasCapability(capabilities, "ops");
}

export function canAccessAudit(capabilities: AppCapability[]): boolean {
	return hasCapability(capabilities, "audit");
}

export function canAccessAdmin(capabilities: AppCapability[]): boolean {
	return capabilities.includes("admin");
}
