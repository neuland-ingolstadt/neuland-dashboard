import { redirect } from "@tanstack/react-router";
import {
	canAccessAnnouncements,
	canAccessAudit,
	canAccessReports,
	canAccessSports,
	hasAppAccess,
	type SessionUser,
} from "#/lib/auth";

export function requireAppUser(
	user: SessionUser | null | undefined,
): SessionUser {
	if (!user) {
		throw redirect({ to: "/login" });
	}
	if (!hasAppAccess(user.capabilities)) {
		throw redirect({ to: "/no-access" });
	}
	return user;
}

export function requireSportsUser(
	user: SessionUser | null | undefined,
): SessionUser {
	const appUser = requireAppUser(user);
	if (!canAccessSports(appUser.capabilities)) {
		throw redirect({ to: "/" });
	}
	return appUser;
}

export function requireAnnouncementsUser(
	user: SessionUser | null | undefined,
): SessionUser {
	const appUser = requireAppUser(user);
	if (!canAccessAnnouncements(appUser.capabilities)) {
		throw redirect({ to: "/" });
	}
	return appUser;
}

export function requireReportsUser(
	user: SessionUser | null | undefined,
): SessionUser {
	const appUser = requireAppUser(user);
	if (!canAccessReports(appUser.capabilities)) {
		throw redirect({ to: "/" });
	}
	return appUser;
}

export function requireAuditUser(
	user: SessionUser | null | undefined,
): SessionUser {
	const appUser = requireAppUser(user);
	if (!canAccessAudit(appUser.capabilities)) {
		throw redirect({ to: "/" });
	}
	return appUser;
}
