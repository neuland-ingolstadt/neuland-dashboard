import type { Column, Table } from "@tanstack/react-table";
import { X } from "lucide-react";
import { Button } from "#/components/ui/button";
import {
	DataTableFacetedFilter,
	type FacetFilter,
} from "#/components/ui/dataTable/facetedFilter";
import { Input } from "#/components/ui/input";

interface SearchFilter {
	column: string;
	title: string;
}

interface DataTableFilterToolbarProps<TData, TValue> {
	table: Table<TData>;
	searchFilter: SearchFilter | undefined;
	selectFilters?: FacetFilter<TData, TValue>[];
}

export type FilterOptions<TData, TValue> = Omit<
	DataTableFilterToolbarProps<TData, TValue>,
	"table"
>;

export function DataTableFilterToolbar<TData, TValue>({
	table,
	searchFilter,
	selectFilters,
}: DataTableFilterToolbarProps<TData, TValue>) {
	const isFiltered = table.getState().columnFilters.length > 0;

	return (
		<div className="flex flex-1 flex-wrap items-center gap-2">
			{searchFilter && (
				<Input
					placeholder={`${searchFilter.title} filtern...`}
					value={
						(table
							.getColumn(searchFilter.column)
							?.getFilterValue() as string) ?? ""
					}
					onChange={(event) =>
						table
							.getColumn(searchFilter.column)
							?.setFilterValue(event.target.value)
					}
					className="h-8 w-full max-w-sm border-border/50 bg-card text-muted-foreground placeholder:text-muted-foreground/80 sm:w-auto sm:min-w-48"
				/>
			)}
			{selectFilters?.map((filter) => (
				<DataTableFacetedFilter
					key={filter.title}
					{...filter}
					column={table.getColumn(filter.column) as Column<TData, TValue>}
				/>
			))}
			{isFiltered && (
				<Button
					variant="ghost"
					onClick={() => table.resetColumnFilters()}
					className="h-8 shrink-0 px-2 lg:px-3"
				>
					Löschen
					<X className="ml-2 h-4 w-4" />
				</Button>
			)}
		</div>
	);
}
