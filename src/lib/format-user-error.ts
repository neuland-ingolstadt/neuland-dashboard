/** Map thrown errors to short German UI messages (no raw GraphQL dumps). */
export function formatUserError(
	err: unknown,
	fallback = "Speichern fehlgeschlagen",
): string {
	if (!err) return fallback;

	const graphqlMessage = extractGraphqlMessage(err);
	const raw =
		graphqlMessage ||
		(err instanceof Error
			? err.message
			: typeof err === "string"
				? err
				: typeof err === "object" &&
						err !== null &&
						"message" in err &&
						typeof (err as { message: unknown }).message === "string"
					? (err as { message: string }).message
					: "");

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

	// Prefer the clean GraphQL first-line if present before JSON noise
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

function extractGraphqlMessage(err: unknown): string | null {
	if (!err || typeof err !== "object") return null;

	const response = (
		err as { response?: { errors?: Array<{ message?: string }> } }
	).response;
	const fromResponse = response?.errors?.[0]?.message;
	if (fromResponse) return fromResponse;

	const message =
		err instanceof Error
			? err.message
			: "message" in err &&
					typeof (err as { message: unknown }).message === "string"
				? (err as { message: string }).message
				: null;
	if (!message) return null;

	// ClientError format: "<graphql message>: {\"response\":...}"
	const match = message.match(/^(.+?):\s*\{"response"/);
	return match?.[1]?.trim() || null;
}
