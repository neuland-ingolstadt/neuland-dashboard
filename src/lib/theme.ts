export const THEME_STORAGE_KEY = "neuland-dashboard-theme" as const;

export type ThemeMode = "system" | "light" | "dark";

export const THEME_CYCLE: ThemeMode[] = ["system", "light", "dark"];

export function applyTheme(mode: ThemeMode) {
	if (typeof document === "undefined") return;
	const root = document.documentElement;
	if (mode === "system") {
		root.removeAttribute("data-theme");
		return;
	}
	root.setAttribute("data-theme", mode);
}

export function readStoredTheme(): ThemeMode {
	if (typeof window === "undefined") return "system";
	const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
	if (stored === "light" || stored === "dark") return stored;
	return "system";
}

export function persistTheme(mode: ThemeMode) {
	if (typeof window === "undefined") return;
	if (mode === "system") {
		window.localStorage.removeItem(THEME_STORAGE_KEY);
		return;
	}
	window.localStorage.setItem(THEME_STORAGE_KEY, mode);
}

export function cycleTheme(mode: ThemeMode): ThemeMode {
	const index = THEME_CYCLE.indexOf(mode);
	return THEME_CYCLE[(index + 1) % THEME_CYCLE.length];
}
