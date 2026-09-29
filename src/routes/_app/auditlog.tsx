import { createFileRoute } from "@tanstack/react-router";
import { AuditTable } from "#/components/audit/audit-table";
import { PageHeader } from "#/components/layout/page-header";
import { listAuditLogFn } from "#/lib/audit.functions";
import { requireAuditUser } from "#/lib/require-app-user";

export const Route = createFileRoute("/_app/auditlog")({
	beforeLoad: ({ context }) => {
		requireAuditUser(context.user);
	},
	loader: () => listAuditLogFn({ data: { limit: 100, offset: 0 } }),
	component: AuditLogPage,
});

function AuditLogPage() {
	const entries = Route.useLoaderData();

	return (
		<>
			<PageHeader
				title="Audit-Log"
				lead="Protokoll aller Änderungen an Dashboard-Daten."
			/>
			<AuditTable entries={entries} />
		</>
	);
}
