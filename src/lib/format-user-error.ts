/** Map thrown errors to short German UI messages. */
export function formatUserError(
	err: unknown,
	fallback = "Speichern fehlgeschlagen",
): string {
	if (!err) return fallback;

	const raw =
		err instanceof Error
			? err.message
			: typeof err === "string"
				? err
				: typeof err === "object" &&
						err !== null &&
						"message" in err &&
						typeof (err as { message: unknown }).message === "string"
					? (err as { message: string }).message
					: "";

	const message = raw.trim();
	if (!message) return fallback;

	const lower = message.toLowerCase();

	if (
		lower.includes("localtime") ||
		lower.includes("localendtime") ||
		lower.includes("starttime") ||
		lower.includes("endtime")
	) {
		return "Bitte eine gültige Uhrzeit angeben.";
	}
	if (lower.includes("description")) {
		return "Beschreibung unvollständig (Deutsch und Englisch nötig, oder beides leer lassen).";
	}
	if (lower.includes("email") || lower.includes("e-mail")) {
		return "Bitte eine gültige E-Mail-Adresse angeben.";
	}
	if (lower.includes("bad_user_input") || lower.includes("got invalid value")) {
		return "Eingaben ungültig. Bitte Pflichtfelder prüfen.";
	}
	if (
		lower.includes("nicht angemeldet") ||
		lower.includes("sitzung abgelaufen") ||
		lower.includes("unauthorized") ||
		lower.includes("401")
	) {
		return "Sitzung abgelaufen. Bitte erneut anmelden.";
	}
	if (
		lower.includes("kein zugang") ||
		lower.includes("forbidden") ||
		lower.includes("403")
	) {
		return "Keine Berechtigung für diese Aktion.";
	}
	if (lower.includes("network") || lower.includes("fetch")) {
		return "Netzwerkfehler. Bitte später erneut versuchen.";
	}

	const beforeJson = message.split(/:\s*\{/)[0]?.trim();
	if (beforeJson && beforeJson.length > 0 && beforeJson.length <= 160) {
		return beforeJson;
	}

	if (
		message.includes('{"') ||
		message.includes('Variable "$') ||
		message.length > 160
	) {
		return fallback;
	}

	return message;
}
