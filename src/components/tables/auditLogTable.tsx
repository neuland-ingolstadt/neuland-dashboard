import { DataTableColumnHeader } from '@/components/ui/dataTable/columnHeader'
import { DataTable } from '@/components/ui/dataTable/dataTable'
import type { AuditLogEntry } from '@/lib/backend/auditLog'
import type { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'

const columns: ColumnDef<AuditLogEntry>[] = [
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Zeitpunkt" />
    ),
    size: 200,
    cell({
      cell: {
        row: {
          original: { createdAt },
        },
      },
    }) {
      return format(new Date(createdAt), 'dd.MM.yyyy HH:mm')
    },
  },
  {
    accessorKey: 'operation',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Operation" />
    ),
    size: 100,
  },
  {
    accessorKey: 'entity',
    header: 'Entity',
  },
  {
    accessorKey: 'entityId',
    header: 'Entity ID',
  },
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'userId',
    header: 'User ID',
  },
]

interface AuditLogTableProps {
  entries: AuditLogEntry[]
}

export default function AuditLogTable({ entries }: AuditLogTableProps) {
  return (
    <DataTable
      columns={columns}
      enablePagination
      enableFilter
      filterOptions={{
        searchFilter: {
          column: 'name',
          title: 'Name',
        },
        selectFilters: [],
      }}
      tableId="auditlog"
      initialSorting={[{ id: 'createdAt', desc: true }]}
      data={entries}
    />
  )
}
