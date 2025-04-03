import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/ui/dataTable/dataTable'
import type { NeulandEvent } from '@/lib/backend/neulandEvents'
import { formatDateInterval } from '@/lib/dateUtils'
import type { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { CalendarOff, MapPin, MapPinOff, Repeat } from 'lucide-react'
import { useRouter } from 'next/router'
import { useMemo } from 'react'

interface NeulandEventsTableProps {
  events: NeulandEvent[]
}

export default function NeulandEventsTable({
  events,
}: NeulandEventsTableProps) {
  const router = useRouter()

  const columns: ColumnDef<NeulandEvent>[] = useMemo(
    () => [
      {
        accessorKey: 'title.de',
        header: 'Title',
      },
      {
        id: 'date',
        size: 250,
        header: 'Datum',
        cell({
          cell: {
            row: {
              original: { startTime, endTime, rrule },
            },
          },
        }) {
          if (!rrule) {
            const start = startTime ? format(startTime, 'dd.MM.yyyy') : ''
            const end = endTime ? format(endTime, 'dd.MM.yyyy') : ''

            if (!startTime && !endTime) {
              return (
                <Badge variant="outline">
                  <CalendarOff size={12} className="mr-2" />
                  <p>Kein Datum angegeben</p>
                </Badge>
              )
            }

            return <p>{`${start}${startTime && endTime ? ` - ${end}` : ''}`}</p>
          }

          return (
            <Badge>
              <Repeat size={12} className="mr-2" />
              <p>Wiederkehrend</p>
            </Badge>
          )
        },
      },
      {
        id: 'location',
        accessorKey: 'location',
        header: 'Ort',
        cell({
          cell: {
            row: {
              original: { location },
            },
          },
        }) {
          if (!location) {
            return (
              <Badge variant="outline">
                <MapPinOff size={12} className="mr-2" />
                <p>Kein Ort angegeben</p>
              </Badge>
            )
          }

          return (
            <Badge variant="secondary">
              <MapPin size={12} className="mr-2" />
              <p className="truncate max-w-32">{location}</p>
            </Badge>
          )
        },
        size: 200,
      },
      {
        id: 'timespan',
        accessorKey: 'startTime',
        header: undefined,
        cell({
          cell: {
            row: {
              original: { startTime, endTime, rrule },
            },
          },
        }) {
          return formatDateInterval(startTime, endTime, rrule)
        },
        size: 250,
      },
    ],
    []
  )

  return (
    <DataTable
      onClick={({ id }) => router.push(`/events/edit?id=${id}`)}
      columns={columns}
      enableFilter
      enablePagination
      filterOptions={{
        searchFilter: {
          column: 'title_de',
          title: 'Titel',
        },
        selectFilters: [],
      }}
      tableId="announcements"
      data={events}
    />
  )
}
