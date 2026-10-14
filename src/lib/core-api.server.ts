import type { paths } from "@neuland-ingolstadt/backend-core-api";
import createClient from "openapi-fetch";
import { serverConfig } from "#/lib/config";

export const coreApiClient = createClient<paths>({
	baseUrl: serverConfig.coreapi.url,
});
