import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/ui/dataTable/columnHeader'
import { DataTable } from '@/components/ui/dataTable/dataTable'
import type { SportsEvent } from '@/lib/backend/sportEvents'
import { weekdays } from '@/lib/utils'
import type { ColumnDef } from '@tanstack/react-table'
import { Calendar, School } from 'lucide-react'
import { useRouter } from 'next/navigation'

const columns: ColumnDef<SportsEvent>[] = [
  {
    filterFn: 'arrIncludesSome',
    accessorKey: 'weekday',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Wochentag" />
    ),
    sortingFn: ({ original: { weekday: a } }, { original: { weekday: b } }) => {
      return weekdays[a].order - weekdays[b].order
    },
    size: 1,
    cell({
      cell: {
        row: {
          original: { weekday },
        },
      },
    }) {
      return (
        <Badge variant="outline" className="flex w-fit flex-row items-center">
          <Calendar className="mr-2" size={12} />
          <p>{weekdays[weekday].de}</p>
        </Badge>
      )
    },
  },
  {
    accessorKey: 'title.de',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
  },
  {
    accessorKey: 'campus',
    header: 'Campus',
    size: 1,
    cell({
      cell: {
        row: {
          original: { campus },
        },
      },
    }) {
      return (
        <Badge variant="outline" className="flex w-fit flex-row items-center">
          <School className="mr-2" size={12} />
          <p>{campus}</p>
        </Badge>
      )
    },
  },
]

interface SportsEventsTableProps {
  events: SportsEvent[]
}

export default function SportsEventsTable({ events }: SportsEventsTableProps) {
  const router = useRouter()

  return (
    <DataTable
      onClick={({ id }) => router.push(`/sports/edit?id=${id}`)}
      columns={columns}
      enableFilter
      enablePagination
      initialSorting={[
        {
          id: 'title_de',
          desc: false,
        },
      ]}
      filterOptions={{
        searchFilter: {
          column: 'title_de',
          title: 'Name',
        },
        selectFilters: [
          {
            column: 'weekday',
            title: 'Wochentag',
            mode: 'multiple',
            options: Object.entries(weekdays).map(([key, { de }]) => ({
              label: de,
              value: key,
            })),
          },
          {
            column: 'campus',
            title: 'Campus',
            mode: 'single',
            options: [
              { label: 'Ingolstadt', value: 'Ingolstadt' },
              { label: 'Neuburg', value: 'Neuburg' },
            ],
          },
        ],
      }}
      tableId="sportEvents"
      data={events}
    />
  )
}
