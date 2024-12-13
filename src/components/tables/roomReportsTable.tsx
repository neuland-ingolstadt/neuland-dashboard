import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTableColumnHeader } from '@/components/ui/dataTable/columnHeader'
import { DataTable } from '@/components/ui/dataTable/dataTable'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { RoomReport } from '@/lib/backend/rootReports'
import { useDialogs } from '@/lib/providers/dialogsProvider'
import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import {
  Check,
  X,
  MapPinX,
  Text,
  MapPinMinus,
  MessageCircleQuestion,
} from 'lucide-react'
import { NextRouter, useRouter } from 'next/router'
import React from 'react'

const columns: (
  dialog: ReturnType<typeof useDialogs>,
  router: NextRouter
) => ColumnDef<RoomReport>[] = (dialog, router) => [
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Erstellt am"
      />
    ),
    cell: ({ cell: { row } }) => {
      return format(row.original.createdAt, 'dd.MM.yyyy')
    },
  },
  {
    accessorKey: 'reason',
    sortingFn: ({ original: { reason: a } }, { original: { reason: b } }) => {
      return a?.localeCompare(b)
    },
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Grund"
      />
    ),
    cell({ cell: { row } }) {
      const icon = {
        WRONG_DESCRIPTION: <Text size={22} />,
        WRONG_LOCATION: <MapPinMinus size={22} />,
        NOT_EXISTING: <X size={22} />,
        MISSING: <MapPinX size={22} />,
        OTHER: <MessageCircleQuestion size={22} />,
      }[row.original.reason]
      const name = {
        WRONG_DESCRIPTION: 'Falsche Beschreibung',
        WRONG_LOCATION: 'Falscher Standort',
        NOT_EXISTING: 'Existiert nicht',
        MISSING: 'Fehlt',
        OTHER: 'Sonstiges',
      }[row.original.reason]
      return (
        <Tooltip>
          <TooltipTrigger>{icon}</TooltipTrigger>
          <TooltipContent>{name}</TooltipContent>
        </Tooltip>
      )
    },
  },
  {
    accessorKey: 'room',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Raum"
      />
    ),
    cell: ({ cell: { row } }) => (
      <Badge variant="secondary">{row.original.room}</Badge>
    ),
  },
  {
    accessorKey: 'description',
    header: 'Beschreibung',
    cell: ({
      cell: {
        row: {
          original: { description },
        },
      },
    }) => (
      <span className="max-h-20 max-w-96 block overflow-ellipsis overflow-hidden">
        {description}
      </span>
    ),
  },
  {
    id: 'resolvedAt',
    header: '',
    cell: ({ row: { original } }) => {
      return original.resolvedAt === null ? (
        <Button
          variant="ghost"
          size="sm"
          className="p-2"
          onClick={async () => {
            dialog.setLoading(true)
            const response = await fetch(`/api/roomreports`, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                id: original.id,
              }),
            })

            if (!response.ok) {
              dialog.openErrorDialog(
                'Der Report konnte nicht als erledigt markiert werden'
              )
              dialog.setLoading(false)
            }

            router.reload()
            dialog.setLoading(false)
          }}
        >
          <Check
            size={20}
            className="text-green-600"
          />
        </Button>
      ) : (
        <span>{original.resolvedAt}</span>
      )
    },
  },
]

interface RoomReportsTableProps {
  reports: RoomReport[]
}

export default function RoomReportsTable({ reports }: RoomReportsTableProps) {
  const dialog = useDialogs()
  const router = useRouter()

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold">Neue Meldungen</h2>
      <DataTable
        columns={columns(dialog, router)}
        enableFilter
        enablePagination
        initialPageSize={5}
        initialSorting={[
          {
            id: 'createdAt',
            desc: false,
          },
        ]}
        filterOptions={{
          searchFilter: {
            column: 'description',
            title: 'Description',
          },
          selectFilters: [
            // TODO add select for reason and room
          ],
        }}
        tableId="roomReports"
        data={reports.filter((r) => r.resolvedAt === null)}
      />
      <h2 className="text-xl font-bold">Abgeschlossene Meldungen</h2>
      <DataTable
        columns={columns(dialog, router)}
        enableFilter
        enablePagination
        initialPageSize={5}
        initialSorting={[
          {
            id: 'createdAt',
            desc: false,
          },
        ]}
        filterOptions={{
          searchFilter: {
            column: 'description',
            title: 'Description',
          },
          selectFilters: [
            // TODO add select for reason and room
          ],
        }}
        tableId="roomReports"
        data={reports.filter((r) => r.resolvedAt !== null)}
      />
    </div>
  )
}
