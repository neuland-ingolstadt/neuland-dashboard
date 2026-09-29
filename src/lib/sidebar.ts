export const SIDEBAR_COLLAPSED_KEY = "neuland-dashboard-sidebar-collapsed";

export function readSidebarCollapsed(): boolean {
	if (typeof window === "undefined") return false;
	try {
		return window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1";
	} catch {
		return false;
	}
}

export function writeSidebarCollapsed(collapsed: boolean): void {
	try {
		window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, collapsed ? "1" : "0");
	} catch {
		/* ignore */
	}
	if (typeof document === "undefined") return;
	if (collapsed) {
		document.documentElement.setAttribute("data-sidebar-collapsed", "");
	} else {
		document.documentElement.removeAttribute("data-sidebar-collapsed");
	}
}
