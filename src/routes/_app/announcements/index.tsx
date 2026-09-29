import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { AnnouncementsTable } from "#/components/announcements/announcements-table";
import { PageHeader } from "#/components/layout/page-header";
import { Button } from "#/components/ui/button";
import { listAnnouncementsFn } from "#/lib/announcements.functions";
import { ROUTES } from "#/lib/constants";
import { requireAnnouncementsUser } from "#/lib/require-app-user";

export const Route = createFileRoute("/_app/announcements/")({
	beforeLoad: ({ context }) => {
		requireAnnouncementsUser(context.user);
	},
	loader: () => listAnnouncementsFn(),
	component: AnnouncementsIndexPage,
});

function AnnouncementsIndexPage() {
	const announcements = Route.useLoaderData();

	return (
		<>
			<PageHeader
				title="Ankündigungen"
				lead="In-App Ankündigungen verwalten."
				end={
					<Button asChild>
						<Link to={ROUTES.ANNOUNCEMENTS_NEW}>
							<Plus aria-hidden />
							Neu
						</Link>
					</Button>
				}
			/>
			<AnnouncementsTable announcements={announcements} />
		</>
	);
}
