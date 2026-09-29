import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "#/components/layout/page-header";
import { SportsForm } from "#/components/sports/sports-form";
import { requireSportsUser } from "#/lib/require-app-user";

export const Route = createFileRoute("/_app/sports/new")({
	beforeLoad: ({ context }) => {
		requireSportsUser(context.user);
	},
	component: SportsNewPage,
});

function SportsNewPage() {
	return (
		<>
			<PageHeader
				title="Neue Sportveranstaltung"
				lead="Lege ein neues Hochschulsportangebot an."
			/>
			<SportsForm mode="create" />
		</>
	);
}
