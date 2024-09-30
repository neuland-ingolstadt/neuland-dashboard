import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/ui/dataTable/columnHeader'
import { DataTable } from '@/components/ui/dataTable/dataTable'
import { Announcement } from '@/lib/backend/announcements'
import { ColumnDef } from '@tanstack/react-table'
import { useRouter } from 'next/router'

const columns: ColumnDef<Announcement>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    size: 1,
    cell({
      cell: {
        row: {
          original: { id },
        },
      },
    }) {
      return <p className="text-muted-foreground">{id}</p>
    },
  },
  {
    accessorKey: 'title.de',
    header: 'Title',
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Status"
      />
    ),
    cell({
      cell: {
        row: {
          original: { startDateTime, endDateTime },
        },
      },
    }) {
      const now = new Date()
      const start = new Date(startDateTime)
      const end = new Date(endDateTime)
      let status = 'Active'
      if (now < start) {
        status = 'Upcoming'
      } else if (now > end) {
        status = 'Past'
      }

      return (
        <Badge
          variant="outline"
          className="flex w-fit flex-row items-center"
        >
          {status}
        </Badge>
      )
    },
    sortingFn: (
      { original: { startDateTime: a } },
      { original: { startDateTime: b } }
    ) => {
      return new Date(a).getTime() - new Date(b).getTime()
    },
    filterFn: (row, columnId, filterValue) => {
      const now = new Date()
      const start = new Date(row.original.startDateTime)
      const end = new Date(row.original.endDateTime)
      let status = 'Active'
      if (now < start) {
        status = 'Upcoming'
      } else if (now > end) {
        status = 'Past'
      }
      return filterValue.includes(status)
    },
  },
  {
    accessorKey: 'timespan',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Timespan"
      />
    ),
    sortingFn: (
      { original: { startDateTime: a } },
      { original: { startDateTime: b } }
    ) => {
      return new Date(a).getTime() - new Date(b).getTime()
    },
    cell({
      cell: {
        row: {
          original: { startDateTime, endDateTime },
        },
      },
    }) {
      const formatDate = (date: Date) => {
        const day = date.getDate().toString().padStart(2, '0')
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const year = date.getFullYear()
        return `${day}.${month}.${year}`
      }

      const start = formatDate(new Date(startDateTime))
      const end = formatDate(new Date(endDateTime))

      return <p>{`${start} - ${end}`}</p>
    },
  },
  {
    filterFn: 'arrIncludesSome',
    accessorKey: 'priority',
    size: 1,
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Priority"
      />
    ),
    sortingFn: (
      { original: { priority: a } },
      { original: { priority: b } }
    ) => {
      return a - b
    },
  },
]

interface AnnouncementsTableProps {
  announcement: Announcement[]
}

export default function AnnouncementsTable({
  announcement,
}: AnnouncementsTableProps) {
  const router = useRouter()

  return (
    <DataTable
      onClick={({ id }) => router.push(`/announcements/edit?id=${id}`)}
      columns={columns}
      enableFilter
      enablePagination
      filterOptions={{
        searchFilter: {
          column: 'title_de',
          title: 'Titel',
        },
        selectFilters: [
          {
            column: 'status',
            title: 'Status',
            options: [
              {
                label: 'Active',
                value: 'Active',
              },
              {
                label: 'Upcoming',
                value: 'Upcoming',
              },
              {
                label: 'Past',
                value: 'Past',
              },
            ],
          },
        ],
      }}
      tableId="announcements"
      data={announcement}
    />
  )
}
