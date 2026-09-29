import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { DashboardPlaceholder } from "#/components/dashboard/dashboard-placeholder";
import { DashboardQueues } from "#/components/dashboard/dashboard-queues";
import { DashboardStats } from "#/components/dashboard/dashboard-stats";
import { PageHeader } from "#/components/layout/page-header";
import { Button } from "#/components/ui/button";
import { canAccessAnnouncements, canAccessSports } from "#/lib/auth";
import { ROUTES } from "#/lib/constants";
import { getDashboardSummaryFn } from "#/lib/dashboard.functions";

export const Route = createFileRoute("/_app/")({
	loader: () => getDashboardSummaryFn(),
	component: HomePage,
});

function HomePage() {
	const { user } = Route.useRouteContext();
	const summary = Route.useLoaderData();
	const caps = user.capabilities;

	const headerActions = (
		<>
			{canAccessSports(caps) ? (
				<Button asChild variant="outline" size="sm">
					<Link to={ROUTES.SPORTS_NEW}>
						<Plus aria-hidden />
						Sport
					</Link>
				</Button>
			) : null}
			{canAccessAnnouncements(caps) ? (
				<Button asChild size="sm">
					<Link to={ROUTES.ANNOUNCEMENTS_NEW}>
						<Plus aria-hidden />
						Ankündigung
					</Link>
				</Button>
			) : null}
		</>
	);

	const hasActions = canAccessSports(caps) || canAccessAnnouncements(caps);

	return (
		<>
			<PageHeader
				title={`Hallo ${user.name}`}
				lead="Willkommen im Neuland Dashboard."
				end={hasActions ? headerActions : undefined}
			/>

			<DashboardStats summary={summary} />
			<DashboardQueues summary={summary} />
			<DashboardPlaceholder />
		</>
	);
}
