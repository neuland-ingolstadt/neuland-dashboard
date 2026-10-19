import { createServerOnlyFn } from "@tanstack/react-start";

export const getCoreApiClient = createServerOnlyFn(async () => {
	const { coreApiClient } = await import("#/lib/core-api.server");
	return coreApiClient;
});
