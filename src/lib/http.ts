/** Mutable 302 - Response.redirect() headers are immutable and break
 *  TanStack Start cookie merge (Set-Cookie from session + Location). */
export function redirectResponse(location: string): Response {
	return new Response(null, {
		status: 302,
		headers: { Location: location },
	});
}
