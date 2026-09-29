import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "#/components/layout/page-header";
import { SportsForm } from "#/components/sports/sports-form";
import { requireSportsUser } from "#/lib/require-app-user";
import { getSportFn } from "#/lib/sports.functions";

export const Route = createFileRoute("/_app/sports/$id")({
	beforeLoad: ({ context }) => {
		requireSportsUser(context.user);
	},
	loader: ({ params }) => getSportFn({ data: { id: params.id } }),
	component: SportsEditPage,
});

function SportsEditPage() {
	const event = Route.useLoaderData();

	return (
		<>
			<PageHeader
				title={event.title.de}
				lead="Sportveranstaltung bearbeiten."
			/>
			<SportsForm mode="edit" event={event} />
		</>
	);
}
