import { useRouter } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
	Check,
	MapPinMinus,
	MapPinX,
	MessageCircleQuestion,
	Text,
	X,
} from "lucide-react";
import {
	createElement,
	useCallback,
	useMemo,
	useState,
	useTransition,
} from "react";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { DataTableColumnHeader } from "#/components/ui/dataTable/columnHeader";
import { DataTable } from "#/components/ui/dataTable/dataTable";
import { resolveRoomReportFn } from "#/lib/room-reports.functions";
import type { RoomReport } from "#/lib/schemas/room-reports";

const REASONS = {
	WRONG_DESCRIPTION: { icon: Text, label: "Falsche Beschreibung" },
	WRONG_LOCATION: { icon: MapPinMinus, label: "Falscher Standort" },
	NOT_EXISTING: { icon: X, label: "Existiert nicht" },
	MISSING: { icon: MapPinX, label: "Fehlt" },
	OTHER: { icon: MessageCircleQuestion, label: "Sonstiges" },
} as const;

export function RoomReportsTable({ reports }: { reports: RoomReport[] }) {
	const router = useRouter();
	const [pendingId, setPendingId] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [, startTransition] = useTransition();

	const onResolve = useCallback(
		(id: string) => {
			setError(null);
			setPendingId(id);
			startTransition(async () => {
				try {
					await resolveRoomReportFn({ data: { id } });
					await router.invalidate();
				} catch (err) {
					setError(
						err instanceof Error ? err.message : "Auflösen fehlgeschlagen",
					);
				} finally {
					setPendingId(null);
				}
			});
		},
		[router],
	);

	const columns: ColumnDef<RoomReport>[] = useMemo(
		() => [
			{
				accessorKey: "createdAt",
				header: ({ column }) => (
					<DataTableColumnHeader column={column} title="Erstellt am" />
				),
				size: 200,
				cell({ row: { original } }) {
					const date = new Date(original.createdAt);
					return `${format(date, "dd.MM.yyyy")} um ${format(date, "HH:mm")} Uhr`;
				},
			},
			{
				accessorKey: "reason",
				size: 180,
				header: ({ column }) => (
					<DataTableColumnHeader column={column} title="Grund" />
				),
				filterFn: "arrIncludesSome",
				cell({ row: { original } }) {
					const reason = REASONS[original.reason];
					return (
						<Badge variant="secondary" className="flex w-fit flex-row gap-1">
							{createElement(reason.icon, { className: "size-3 shrink-0" })}
							<span className="truncate">{reason.label}</span>
						</Badge>
					);
				},
			},
			{
				accessorKey: "room",
				size: 100,
				header: ({ column }) => (
					<DataTableColumnHeader column={column} title="Raum" />
				),
				cell({ row: { original } }) {
					return (
						<a
							href={`https://neuland.app/de/rooms/?highlight=${encodeURIComponent(original.room)}`}
							target="_blank"
							rel="noopener noreferrer"
							onClick={(e) => e.stopPropagation()}
						>
							<Badge variant="secondary">{original.room}</Badge>
						</a>
					);
				},
			},
			{
				accessorKey: "description",
				header: "Beschreibung",
				cell({ row: { original } }) {
					return (
						<span className="line-clamp-2 max-w-sm text-muted-foreground">
							{original.description}
						</span>
					);
				},
			},
			{
				id: "status",
				accessorFn: (row) => (row.resolvedAt ? "resolved" : "open"),
				header: "Status",
				size: 110,
				filterFn: (row, id, filterValue: string[]) => {
					const value = row.getValue<string>(id);
					return filterValue.includes(value);
				},
				cell({ row: { original } }) {
					return (
						<Badge variant={original.resolvedAt ? "muted" : "default"}>
							{original.resolvedAt ? "Erledigt" : "Offen"}
						</Badge>
					);
				},
			},
			{
				id: "actions",
				size: 110,
				enableSorting: false,
				header: () => <span className="sr-only">Aktionen</span>,
				cell({ row: { original } }) {
					if (original.resolvedAt) return null;
					return (
						<div className="flex justify-end">
							<Button
								type="button"
								size="sm"
								variant="outline"
								disabled={pendingId === original.id}
								onClick={(e) => {
									e.stopPropagation();
									onResolve(original.id);
								}}
							>
								{pendingId === original.id ? "…" : "Auflösen"}
								<Check className="size-3.5" aria-hidden />
							</Button>
						</div>
					);
				},
			},
		],
		[pendingId, onResolve],
	);

	return (
		<div className="space-y-3">
			{error ? (
				<p className="error-banner" role="alert">
					{error}
				</p>
			) : null}
			<DataTable
				tableId="roomReports"
				columns={columns}
				data={reports}
				enableFilter
				enablePagination
				initialPageSize={10}
				initialSorting={[{ id: "createdAt", desc: true }]}
				filterOptions={{
					searchFilter: {
						column: "description",
						title: "Beschreibung",
					},
					selectFilters: [
						{
							column: "reason",
							title: "Grund",
							mode: "multiple",
							options: Object.entries(REASONS).map(([value, { label }]) => ({
								value,
								label,
							})),
						},
						{
							column: "status",
							title: "Status",
							mode: "multiple",
							options: [
								{ value: "open", label: "Offen" },
								{ value: "resolved", label: "Erledigt" },
							],
						},
					],
				}}
			/>
		</div>
	);
}
