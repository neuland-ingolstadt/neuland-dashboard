import {
  DataTableFilterToolbar,
  type FilterOptions,
} from '@/components/ui/dataTable/filterToolbar'
import { DataTablePagination } from '@/components/ui/dataTable/paginationToolbar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type TableState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useEffect, useMemo, useState } from 'react'

type DataTableProps<TData, TValue> = {
  tableId: string
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onClick?: (item: TData) => void
  initialSorting?: SortingState
} & (
  | {
      enableFilter: true
      filterOptions: FilterOptions<TData, TValue>
    }
  | { enableFilter?: false; filterOptions?: never }
) &
  (
    | {
        enablePagination: true
        initialPageSize?: number
      }
    | { enablePagination?: false; initialPageSize?: never }
  )

export function DataTable<TData, TValue>({
  tableId,
  columns,
  data,
  onClick,
  enablePagination = false,
  enableFilter = false,
  filterOptions,
  initialPageSize,
  initialSorting,
}: DataTableProps<TData, TValue>) {
  const tableStateKey = useMemo(() => `tableState-${tableId}`, [tableId])
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const initialState: Partial<TableState> = useMemo(() => {
    if (typeof window === 'undefined') return

    const tableState = localStorage.getItem(tableStateKey)
    return tableState ? JSON.parse(tableState) : {}
  }, [tableStateKey])

  const [sorting, setSorting] = useState<SortingState>(initialSorting || [])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    initialState?.columnFilters ?? []
  )

  useEffect(() => {
    if (typeof window === 'undefined') return

    localStorage.setItem(
      tableStateKey,
      JSON.stringify({ sorting, columnFilters })
    )
  }, [sorting, columnFilters, tableStateKey])

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: initialPageSize ?? 10,
      },
    },
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getPaginationRowModel: enablePagination
      ? getPaginationRowModel()
      : undefined,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: enableFilter ? getFilteredRowModel() : undefined,
  })

  if (!isClient) return null

  return (
    <div className="flex flex-col gap-3">
      {enableFilter && (
        <DataTableFilterToolbar
          table={table}
          searchFilter={filterOptions?.searchFilter}
          selectFilters={filterOptions?.selectFilters}
        />
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      style={{
                        width:
                          header.getSize() !== 150
                            ? header.getSize()
                            : undefined,
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className={cn({
                    'cursor-pointer': !!onClick,
                  })}
                  onClick={onClick ? () => onClick(row.original) : undefined}
                >
                  {row.getAllCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Keine Einträge.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {enablePagination && <DataTablePagination table={table} />}
    </div>
  )
}
