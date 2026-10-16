import type { paths } from "@neuland-ingolstadt/backend-core-api";
import createClient from "openapi-fetch";
import { serverConfig } from "#/lib/config";

export const coreApiClient = createClient<paths>({
	baseUrl: serverConfig.coreapi.url,
});

// Body-less error responses (e.g. 401) leave `error` empty, so failures are
// turned into exceptions here instead of relying on the `error` field.
coreApiClient.use({
	async onResponse({ response }) {
		if (response.ok) return undefined;
		let detail = "";
		try {
			const problem = (await response.clone().json()) as {
				title?: string;
				detail?: string;
			};
			detail = problem.detail || problem.title || "";
		} catch {
			// no JSON body
		}
		console.error("[core-api]", response.status, response.url, detail);
		throw new Error(
			detail ? `${response.status}: ${detail}` : `Core API ${response.status}`,
		);
	},
});
