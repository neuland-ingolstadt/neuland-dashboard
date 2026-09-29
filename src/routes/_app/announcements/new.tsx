import { createFileRoute } from "@tanstack/react-router";
import { AnnouncementForm } from "#/components/announcements/announcement-form";
import { PageHeader } from "#/components/layout/page-header";
import { requireAnnouncementsUser } from "#/lib/require-app-user";

export const Route = createFileRoute("/_app/announcements/new")({
	beforeLoad: ({ context }) => {
		requireAnnouncementsUser(context.user);
	},
	component: AnnouncementsNewPage,
});

function AnnouncementsNewPage() {
	return (
		<>
			<PageHeader
				title="Neue Ankündigung"
				lead="Erstelle eine neue In-App Ankündigung."
			/>
			<AnnouncementForm mode="create" />
		</>
	);
}
