export const BUILD_COMMIT =
	(typeof import.meta !== "undefined" &&
		(import.meta as { env?: { VITE_BUILD_COMMIT?: string } }).env
			?.VITE_BUILD_COMMIT) ||
	"dev";
