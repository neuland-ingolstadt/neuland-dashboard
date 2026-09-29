import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import {
	contentDomains,
	DashboardEmptyWorkspace,
	DashboardFocus,
	homeLeadFor,
} from "#/components/dashboard/dashboard-focus";
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
	const domains = contentDomains(summary);
	const isFocused = domains.length === 1;

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

	// Focused landings already expose primary CTAs in the hero.
	const hasHeaderActions =
		!isFocused && (canAccessSports(caps) || canAccessAnnouncements(caps));

	return (
		<>
			<PageHeader
				title={`Hallo ${user.name}`}
				lead={homeLeadFor(summary)}
				end={hasHeaderActions ? headerActions : undefined}
			/>

			{isFocused ? (
				<DashboardFocus summary={summary} />
			) : domains.length === 0 ? (
				<DashboardEmptyWorkspace />
			) : (
				<>
					<DashboardStats summary={summary} />
					<DashboardQueues summary={summary} />
				</>
			)}
		</>
	);
}
