import { Button } from '@/components/ui/button'
import {
  DataTableFacetedFilter,
  FacetFilter,
} from '@/components/ui/dataTable/facetedFilter'
import { Input } from '@/components/ui/input'
import { Column, Table } from '@tanstack/react-table'
import { X } from 'lucide-react'
interface SearchFilter {
  column: string
  title: string
}

interface DataTableFilterToolbarProps<TData, TValue> {
  table: Table<TData>
  searchFilter: SearchFilter
  selectFilters?: FacetFilter<TData, TValue>[]
}

export type FilterOptions<TData, TValue> = Omit<
  DataTableFilterToolbarProps<TData, TValue>,
  'table'
>

export function DataTableFilterToolbar<TData, TValue>({
  table,
  searchFilter,
  selectFilters,
}: DataTableFilterToolbarProps<TData, TValue>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="flex flex-1 items-center space-x-2">
      <Input
        placeholder={`${searchFilter.title} filtern...`}
        value={
          (table.getColumn(searchFilter.column)?.getFilterValue() as string) ??
          ''
        }
        onChange={(event) =>
          table
            .getColumn(searchFilter.column)
            ?.setFilterValue(event.target.value)
        }
        className="h-8 w-[150px] lg:w-[250px]"
      />
      {selectFilters?.map((filter, idx) => (
        <DataTableFacetedFilter
          key={idx}
          {...filter}
          column={table.getColumn(filter.column) as Column<TData, TValue>}
        />
      ))}
      {isFiltered && (
        <Button
          variant="ghost"
          onClick={() => table.resetColumnFilters()}
          className="h-8 px-2 lg:px-3"
        >
          Löschen
          <X className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
