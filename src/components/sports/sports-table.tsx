import { useNavigate } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { Calendar, ChevronRight, School } from "lucide-react";
import { Badge } from "#/components/ui/badge";
import { DataTableColumnHeader } from "#/components/ui/dataTable/columnHeader";
import { DataTable } from "#/components/ui/dataTable/dataTable";
import type { SportsEvent } from "#/lib/schemas/sports";
import { formatTime, weekdays } from "#/lib/utils";

const columns: ColumnDef<SportsEvent>[] = [
	{
		filterFn: "arrIncludesSome",
		accessorKey: "weekday",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Wochentag" />
		),
		sortingFn: ({ original: { weekday: a } }, { original: { weekday: b } }) =>
			weekdays[a].order - weekdays[b].order,
		size: 140,
		cell({ row: { original } }) {
			return (
				<Badge variant="outline" className="flex w-fit flex-row items-center">
					<Calendar className="size-3" aria-hidden />
					{weekdays[original.weekday].de}
				</Badge>
			);
		},
	},
	{
		id: "title_de",
		accessorKey: "title.de",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Name" />
		),
	},
	{
		accessorKey: "campus",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Campus" />
		),
		size: 130,
		filterFn: (row, id, filterValue: string[]) => {
			const value = row.getValue<string>(id);
			return filterValue.includes(value);
		},
		cell({ row: { original } }) {
			return (
				<Badge variant="outline" className="flex w-fit flex-row items-center">
					<School className="size-3" aria-hidden />
					{original.campus}
				</Badge>
			);
		},
	},
	{
		id: "time",
		accessorFn: (row) => row.startTime,
		header: "Zeit",
		size: 120,
		cell({ row: { original } }) {
			return (
				<span className="text-muted-foreground">
					{formatTime(original.startTime)}
					{original.endTime ? ` – ${formatTime(original.endTime)}` : ""}
				</span>
			);
		},
	},
	{
		accessorKey: "location",
		header: "Ort",
		cell({ row: { original } }) {
			return <span className="text-muted-foreground">{original.location}</span>;
		},
	},
	{
		id: "actions",
		size: 40,
		enableSorting: false,
		header: () => <span className="sr-only">Bearbeiten</span>,
		cell: () => (
			<span className="flex justify-end text-muted-foreground">
				<ChevronRight className="size-4" aria-hidden />
			</span>
		),
	},
];

export function SportsTable({ events }: { events: SportsEvent[] }) {
	const navigate = useNavigate();

	return (
		<DataTable
			tableId="sportEvents"
			columns={columns}
			data={events}
			enableFilter
			enablePagination
			initialPageSize={10}
			initialSorting={[{ id: "weekday", desc: false }]}
			onClick={({ id }) => {
				void navigate({ to: "/sports/$id", params: { id } });
			}}
			filterOptions={{
				searchFilter: {
					column: "title_de",
					title: "Name",
				},
				selectFilters: [
					{
						column: "weekday",
						title: "Wochentag",
						mode: "multiple",
						options: Object.entries(weekdays).map(([key, { de }]) => ({
							label: de,
							value: key,
						})),
					},
					{
						column: "campus",
						title: "Campus",
						mode: "single",
						options: [
							{ label: "Ingolstadt", value: "Ingolstadt" },
							{ label: "Neuburg", value: "Neuburg" },
						],
					},
				],
			}}
		/>
	);
}
