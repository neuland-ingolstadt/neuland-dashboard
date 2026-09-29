import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "#/components/layout/page-header";
import { RoomReportsTable } from "#/components/roomreports/room-reports-table";
import { requireReportsUser } from "#/lib/require-app-user";
import { listRoomReportsFn } from "#/lib/room-reports.functions";

export const Route = createFileRoute("/_app/roomreports")({
	beforeLoad: ({ context }) => {
		requireReportsUser(context.user);
	},
	loader: () => listRoomReportsFn(),
	component: RoomReportsPage,
});

function RoomReportsPage() {
	const reports = Route.useLoaderData();

	return (
		<>
			<PageHeader
				title="Raummeldungen"
				lead="Meldungen zu Rauminformationen prüfen und erledigen."
			/>
			<RoomReportsTable reports={reports} />
		</>
	);
}
