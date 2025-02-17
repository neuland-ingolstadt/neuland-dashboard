import { platforms, userKinds } from '@/components/ui/announcementForm'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/ui/dataTable/columnHeader'
import { DataTable } from '@/components/ui/dataTable/dataTable'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { Announcement } from '@/lib/backend/announcements'
import {
  announcementStatus,
  useAnnouncementsUtils,
} from '@/lib/hooks/annoucmentsHook'
import { cn } from '@/lib/utils'
import type { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { useRouter } from 'next/router'
import React, { useMemo } from 'react'

interface AnnouncementsTableProps {
  announcement: Announcement[]
}

export default function AnnouncementsTable({
  announcement,
}: AnnouncementsTableProps) {
  const router = useRouter()
  const { getStatus, getStatusClasses } = useAnnouncementsUtils()
  const columns: ColumnDef<Announcement>[] = useMemo(
    () => [
      {
        accessorKey: 'status',
        size: 1,
        header: 'Status',
        cell({
          cell: {
            row: { original },
          },
        }) {
          return (
            <Badge
              variant="outline"
              className={cn(
                'flex w-fit flex-row items-center text-white',
                getStatusClasses(getStatus(original))
              )}
            >
              {announcementStatus[getStatus(original)]}
            </Badge>
          )
        },
        sortingFn: (
          { original: { startDateTime: a } },
          { original: { startDateTime: b } }
        ) => {
          return a.getTime() - b.getTime()
        },
        filterFn: (row, _, filterValue) => {
          const status = getStatus(row.original)
          return filterValue.includes(status)
        },
      },
      {
        accessorKey: 'title.de',
        header: 'Title',
      },
      {
        accessorKey: 'platform',
        size: 50,
        header: 'Plattform',
        filterFn: 'arrIncludesSome',
        cell({
          cell: {
            row: { original },
          },
        }) {
          return (
            <div className="flex flex-row gap-2">
              {platforms
                .filter(({ value }) => original.platform.includes(value))
                .map(({ value, icon, label }) => (
                  <Tooltip key={value}>
                    <TooltipTrigger>
                      <Badge key={value} variant="outline">
                        {React.createElement(icon, {
                          className: 'w-3 h-3',
                        })}
                      </Badge>
                    </TooltipTrigger>

                    <TooltipContent>{label}</TooltipContent>
                  </Tooltip>
                ))}
            </div>
          )
        },
      },
      {
        accessorKey: 'userKind',
        header: 'Nutzergruppe',
        size: 50,
        filterFn: 'arrIncludesSome',
        cell({
          cell: {
            row: { original },
          },
        }) {
          return (
            <div className="flex flex-row gap-2">
              {userKinds
                .filter(({ value }) => original.userKind.includes(value))
                .map(({ icon, value, label }) => (
                  <Tooltip key={value}>
                    <TooltipTrigger>
                      <Badge key={value} variant="outline">
                        {React.createElement(icon, {
                          className: 'w-3 h-3',
                        })}
                      </Badge>
                    </TooltipTrigger>

                    <TooltipContent>{label}</TooltipContent>
                  </Tooltip>
                ))}
            </div>
          )
        },
      },
      {
        id: 'timespan',
        size: 250,
        header: 'Zeitraum',
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
          const start = format(startDateTime, 'dd.MM.yyyy')
          const end = format(endDateTime, 'dd.MM.yyyy')

          return <p>{`${start} - ${end}`}</p>
        },
      },
      {
        filterFn: 'arrIncludesSome',
        accessorKey: 'priority',
        size: 1,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Priorität" />
        ),
        sortingFn: (
          { original: { priority: a } },
          { original: { priority: b } }
        ) => {
          return a - b
        },
      },
    ],
    [getStatus, getStatusClasses]
  )

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
            options: Object.entries(announcementStatus).map(
              ([value, label]) => ({
                value,
                label,
              })
            ),
          },
          {
            column: 'platform',
            title: 'Plattform',
            options: platforms,
          },
          {
            column: 'userKind',
            title: 'Nutzergruppe',
            options: userKinds,
          },
        ],
      }}
      tableId="announcements"
      data={announcement}
    />
  )
}
