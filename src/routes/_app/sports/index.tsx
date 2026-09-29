import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { PageHeader } from "#/components/layout/page-header";
import { SportsTable } from "#/components/sports/sports-table";
import { Button } from "#/components/ui/button";
import { ROUTES } from "#/lib/constants";
import { requireSportsUser } from "#/lib/require-app-user";
import { listSportsFn } from "#/lib/sports.functions";

export const Route = createFileRoute("/_app/sports/")({
	beforeLoad: ({ context }) => {
		requireSportsUser(context.user);
	},
	loader: () => listSportsFn(),
	component: SportsIndexPage,
});

function SportsIndexPage() {
	const events = Route.useLoaderData();

	return (
		<>
			<PageHeader
				title="Hochschulsport"
				lead="Sportveranstaltungen verwalten."
				end={
					<Button asChild>
						<Link to={ROUTES.SPORTS_NEW}>
							<Plus aria-hidden />
							Neu
						</Link>
					</Button>
				}
			/>
			<SportsTable events={events} />
		</>
	);
}
