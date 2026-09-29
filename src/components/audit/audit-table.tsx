import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "#/components/ui/badge";
import { DataTableColumnHeader } from "#/components/ui/dataTable/columnHeader";
import { DataTable } from "#/components/ui/dataTable/dataTable";
import { Tooltip } from "#/components/ui/tooltip";
import { formatEnumLabel } from "#/lib/labels";
import type { AuditLogEntry } from "#/lib/schemas/audit-log";

const OPERATION_LABELS: Record<string, string> = {
	insert: "Erstellt",
	update: "Bearbeitet",
	delete: "Gelöscht",
};

const OPERATION_VARIANTS: Record<
	string,
	"default" | "secondary" | "destructive"
> = {
	insert: "default",
	update: "secondary",
	delete: "destructive",
};

const OPERATION_FILTER_OPTIONS = [
	{ label: "Erstellt", value: "insert" },
	{ label: "Bearbeitet", value: "update" },
	{ label: "Gelöscht", value: "delete" },
];

const columns: ColumnDef<AuditLogEntry>[] = [
	{
		accessorKey: "createdAt",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Zeitpunkt" />
		),
		size: 180,
		cell({ row: { original } }) {
			return format(new Date(original.createdAt), "dd.MM.yyyy HH:mm");
		},
	},
	{
		accessorKey: "operation",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Operation" />
		),
		size: 120,
		filterFn: (row, id, filterValue: string[]) => {
			const value = row.getValue<string>(id);
			return filterValue.includes(value);
		},
		cell({ row: { original } }) {
			return (
				<Badge variant={OPERATION_VARIANTS[original.operation] || "default"}>
					{OPERATION_LABELS[original.operation] ||
						formatEnumLabel(original.operation)}
				</Badge>
			);
		},
	},
	{
		accessorKey: "entity",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Entität" />
		),
		filterFn: (row, id, filterValue: string[]) => {
			const value = row.getValue<string>(id);
			return filterValue.includes(value);
		},
		cell({ row: { original } }) {
			return formatEnumLabel(original.entity);
		},
	},
	{
		accessorKey: "entityId",
		header: "Entity ID",
		cell({ row: { original } }) {
			return (
				<span className="font-mono text-xs text-muted-foreground">
					{original.entityId}
				</span>
			);
		},
	},
	{
		accessorKey: "name",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Name" />
		),
		cell({ row: { original } }) {
			return (
				<Tooltip label={`User ID: ${original.userId}`} side="top">
					<span className="cursor-help underline decoration-dotted underline-offset-2">
						{original.name}
					</span>
				</Tooltip>
			);
		},
	},
];

function getEntityFilterOptions(entries: AuditLogEntry[]) {
	const unique = Array.from(
		new Set(entries.map((e) => e.entity).filter(Boolean)),
	);
	return unique.map((entity) => ({
		label: formatEnumLabel(entity),
		value: entity,
	}));
}

export function AuditTable({ entries }: { entries: AuditLogEntry[] }) {
	const entityOptions = getEntityFilterOptions(entries);

	return (
		<DataTable
			tableId="auditlog"
			columns={columns}
			data={entries}
			enablePagination
			enableFilter
			initialPageSize={20}
			initialSorting={[{ id: "createdAt", desc: true }]}
			filterOptions={{
				searchFilter: {
					column: "name",
					title: "Name",
				},
				selectFilters: [
					{
						column: "operation",
						title: "Operation",
						mode: "multiple",
						options: OPERATION_FILTER_OPTIONS,
					},
					{
						column: "entity",
						title: "Entität",
						mode: "multiple",
						options: entityOptions,
					},
				],
			}}
		/>
	);
}
