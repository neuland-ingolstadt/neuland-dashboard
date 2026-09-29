import { useNavigate } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ChevronRight } from "lucide-react";
import { useMemo } from "react";
import { Badge } from "#/components/ui/badge";
import { DataTableColumnHeader } from "#/components/ui/dataTable/columnHeader";
import { DataTable } from "#/components/ui/dataTable/dataTable";
import {
	announcementStatus,
	getAnnouncementStatus,
	getAnnouncementStatusMeta,
} from "#/lib/announcement-status";
import {
	PLATFORM_OPTIONS,
	platformLabel,
	USER_KIND_OPTIONS,
	userKindLabel,
} from "#/lib/labels";
import type { Announcement } from "#/lib/schemas/announcements";
import { cn } from "#/lib/utils";

export function AnnouncementsTable({
	announcements,
}: {
	announcements: Announcement[];
}) {
	const navigate = useNavigate();

	const columns: ColumnDef<Announcement>[] = useMemo(
		() => [
			{
				id: "status",
				accessorFn: (row) => getAnnouncementStatus(row),
				size: 110,
				header: ({ column }) => (
					<DataTableColumnHeader column={column} title="Status" />
				),
				cell({ row: { original } }) {
					const status = getAnnouncementStatus(original);
					const { icon: Icon, className } = getAnnouncementStatusMeta(status);
					const label = announcementStatus[status];
					return (
						<span
							className="inline-flex items-center justify-center"
							title={label}
						>
							<Icon className={cn("size-4", className)} aria-label={label} />
							<span className="sr-only">{label}</span>
						</span>
					);
				},
				sortingFn: (
					{ original: { startDateTime: a } },
					{ original: { startDateTime: b } },
				) => new Date(a).getTime() - new Date(b).getTime(),
				filterFn: (row, _, filterValue: string[]) => {
					const status = getAnnouncementStatus(row.original);
					return filterValue.includes(status);
				},
			},
			{
				id: "title_de",
				accessorKey: "title.de",
				header: ({ column }) => (
					<DataTableColumnHeader column={column} title="Titel" />
				),
			},
			{
				accessorKey: "platform",
				size: 160,
				header: "Plattform",
				filterFn: "arrIncludesSome",
				cell({ row: { original } }) {
					return (
						<div className="flex flex-wrap gap-1.5">
							{original.platform.map((platform) => (
								<Badge key={platform} variant="outline">
									{platformLabel(platform)}
								</Badge>
							))}
						</div>
					);
				},
			},
			{
				accessorKey: "userKind",
				size: 160,
				header: "Zielgruppe",
				filterFn: "arrIncludesSome",
				cell({ row: { original } }) {
					return (
						<div className="flex flex-wrap gap-1.5">
							{original.userKind.map((kind) => (
								<Badge key={kind} variant="outline">
									{userKindLabel(kind)}
								</Badge>
							))}
						</div>
					);
				},
			},
			{
				id: "timespan",
				size: 180,
				header: ({ column }) => (
					<DataTableColumnHeader column={column} title="Zeitraum" />
				),
				sortingFn: (
					{ original: { startDateTime: a } },
					{ original: { startDateTime: b } },
				) => new Date(a).getTime() - new Date(b).getTime(),
				cell({ row: { original } }) {
					const start = format(new Date(original.startDateTime), "dd.MM.yyyy");
					const end = format(new Date(original.endDateTime), "dd.MM.yyyy");
					return (
						<span className="text-muted-foreground">
							{start} – {end}
						</span>
					);
				},
			},
			{
				accessorKey: "priority",
				size: 90,
				header: ({ column }) => (
					<DataTableColumnHeader column={column} title="Priorität" />
				),
				sortingFn: (
					{ original: { priority: a } },
					{ original: { priority: b } },
				) => a - b,
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
		],
		[],
	);

	return (
		<DataTable
			tableId="announcements"
			columns={columns}
			data={announcements}
			enableFilter
			enablePagination
			initialPageSize={10}
			initialSorting={[{ id: "timespan", desc: false }]}
			onClick={({ id }) => {
				void navigate({ to: "/announcements/$id", params: { id } });
			}}
			filterOptions={{
				searchFilter: {
					column: "title_de",
					title: "Titel",
				},
				selectFilters: [
					{
						column: "status",
						title: "Status",
						options: (
							Object.keys(announcementStatus) as Array<
								keyof typeof announcementStatus
							>
						).map((value) => {
							const { icon, className } = getAnnouncementStatusMeta(value);
							return {
								value,
								label: announcementStatus[value],
								icon: ({ className: base }) => {
									const Icon = icon;
									return <Icon className={cn(base, className)} />;
								},
							};
						}),
					},
					{
						column: "platform",
						title: "Plattform",
						options: PLATFORM_OPTIONS.map(({ value, label }) => ({
							value,
							label,
						})),
					},
					{
						column: "userKind",
						title: "Zielgruppe",
						options: USER_KIND_OPTIONS.map(({ value, label }) => ({
							value,
							label,
						})),
					},
				],
			}}
		/>
	);
}
