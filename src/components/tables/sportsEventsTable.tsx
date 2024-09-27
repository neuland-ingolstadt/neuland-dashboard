import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/ui/dataTable/dataTable'
import { SportsEvent } from '@/lib/backend/sportEvents'
import { weekdays } from '@/lib/utils'
import { ColumnDef } from '@tanstack/react-table'
import { Calendar, School } from 'lucide-react'
import { useRouter } from 'next/router'

const columns: ColumnDef<SportsEvent>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    size: 1,
  },
  {
    accessorKey: 'title.de',
    header: 'Name',
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
        <Badge
          variant="outline"
          className="flex w-fit flex-row items-center"
        >
          <School
            className="mr-2"
            size={12}
          />
          <p>{campus}</p>
        </Badge>
      )
    },
  },
  {
    filterFn: 'arrIncludesSome',
    accessorKey: 'weekday',
    header: 'Wochentag',
    size: 1,
    cell({
      cell: {
        row: {
          original: { weekday },
        },
      },
    }) {
      return (
        <Badge
          variant="outline"
          className="flex w-fit flex-row items-center"
        >
          <Calendar
            className="mr-2"
            size={12}
          />
          <p>{weekdays[weekday].de}</p>
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
      onClick={({ id }) => router.push(`/dashboard/sports/edit?id=${id}`)}
      columns={columns}
      enableFilter
      filterOptions={{
        searchFilter: {
          column: 'title_de',
          title: 'Name',
        },
        selectFilters: [
          {
            column: 'campus',
            title: 'Campus',
            mode: 'single',
            options: [
              { label: 'Ingolstadt', value: 'Ingolstadt' },
              { label: 'Neuburg', value: 'Neuburg' },
            ],
          },
          {
            column: 'weekday',
            title: 'Wochentag',
            mode: 'multiple',
            options: Object.entries(weekdays).map(([key, { de }]) => ({
              label: de,
              value: key,
            })),
          },
        ],
      }}
      tableId="sportEvents"
      data={events}
    />
  )
}
