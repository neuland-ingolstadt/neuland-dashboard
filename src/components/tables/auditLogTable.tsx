import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/ui/dataTable/columnHeader'
import { DataTable } from '@/components/ui/dataTable/dataTable'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { AuditLogEntry } from '@/lib/backend/auditLog'
import type { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'

const OPERATION_LABELS: Record<string, string> = {
  insert: 'Erstellt',
  update: 'Bearbeitet',
  delete: 'Gelöscht',
}

const OPERATION_VARIANTS: Record<
  string,
  'default' | 'secondary' | 'destructive'
> = {
  insert: 'default',
  update: 'secondary',
  delete: 'destructive',
}

const OPERATION_FILTER_OPTIONS = [
  { label: 'Erstellt', value: 'insert' },
  { label: 'Bearbeitet', value: 'update' },
  { label: 'Gelöscht', value: 'delete' },
]

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
    size: 120,
    cell({
      cell: {
        row: {
          original: { operation },
        },
      },
    }) {
      return (
        <Badge variant={OPERATION_VARIANTS[operation] || 'default'}>
          {OPERATION_LABELS[operation] || operation}
        </Badge>
      )
    },
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
    cell({
      cell: {
        row: {
          original: { name, userId },
        },
      },
    }) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-help underline decoration-dotted underline-offset-2">
              {name}
            </span>
          </TooltipTrigger>
          <TooltipContent side="top">
            <span>User ID: {userId}</span>
          </TooltipContent>
        </Tooltip>
      )
    },
  },
]

interface AuditLogTableProps {
  entries: AuditLogEntry[]
}

function getEntityFilterOptions(entries: AuditLogEntry[]) {
  const unique = Array.from(
    new Set(entries.map((e) => e.entity).filter(Boolean))
  )
  return unique.map((entity) => ({ label: entity, value: entity }))
}

export default function AuditLogTable({ entries }: AuditLogTableProps) {
  const entityOptions = getEntityFilterOptions(entries)
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
        selectFilters: [
          {
            column: 'operation',
            title: 'Operation',
            mode: 'multiple',
            options: OPERATION_FILTER_OPTIONS,
          },
          {
            column: 'entity',
            title: 'Entity',
            mode: 'multiple',
            options: entityOptions,
          },
        ],
      }}
      tableId="auditlog"
      initialSorting={[{ id: 'createdAt', desc: true }]}
      data={entries}
    />
  )
}
