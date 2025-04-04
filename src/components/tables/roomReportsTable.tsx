import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTableColumnHeader } from '@/components/ui/dataTable/columnHeader'
import { DataTable } from '@/components/ui/dataTable/dataTable'
import type { FacetFilter } from '@/components/ui/dataTable/facetedFilter'
import type { RoomReport } from '@/lib/backend/rootReports'
import { useDialogs } from '@/lib/providers/dialogsProvider'
import type { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import {
  Check,
  MapPinMinus,
  MapPinX,
  MessageCircleQuestion,
  Text,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { type NextRouter, useRouter } from 'next/router'
import React from 'react'

const REASONS = {
  WRONG_DESCRIPTION: {
    icon: Text,
    label: 'Falsche Beschreibung',
  },
  WRONG_LOCATION: {
    icon: MapPinMinus,
    label: 'Falscher Standort',
  },
  NOT_EXISTING: {
    icon: X,
    label: 'Existiert nicht',
  },
  MISSING: {
    icon: MapPinX,
    label: 'Fehlt',
  },
  OTHER: {
    icon: MessageCircleQuestion,
    label: 'Sonstiges',
  },
}

const columns: (
  dialog: ReturnType<typeof useDialogs>,
  router: NextRouter
) => ColumnDef<RoomReport>[] = (dialog, router) => [
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Erstellt am" />
    ),
    size: 300,
    cell: ({
      cell: {
        row: {
          original: { createdAt },
        },
      },
    }) => {
      return `${format(createdAt, 'dd.MM.yyyy')} um ${format(createdAt, 'HH:mm')} Uhr`
    },
  },
  {
    accessorKey: 'reason',
    size: 180,
    sortingFn: ({ original: { reason: a } }, { original: { reason: b } }) => {
      return a?.localeCompare(b)
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Grund" />
    ),
    cell({
      cell: {
        row: {
          original: { reason },
        },
      },
    }) {
      return (
        <Badge className="flex flex-row gap-1 w-fit" variant="secondary">
          {React.createElement(REASONS[reason].icon, {
            className: 'h-3 w-4',
          })}
          <span className="truncate line-clamp-1">{REASONS[reason].label}</span>
        </Badge>
      )
    },
  },
  {
    accessorKey: 'room',
    size: 1,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Raum" />
    ),
    cell: ({
      cell: {
        row: {
          original: { room },
        },
      },
    }) => (
      <Link
        href={`https://neuland.app/de/rooms/?highlight=${room}`}
        target="_blank"
      >
        <Badge variant="secondary">{room}</Badge>
      </Link>
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
    size: 210,
    cell: ({
      row: {
        original: { resolvedAt, id },
      },
    }) => {
      return resolvedAt === null ? (
        <Button
          variant="outline"
          className="w-full"
          onClick={async () => {
            dialog.setLoading(true)
            const response = await fetch('/api/roomreports', {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                id,
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
          <Check size={16} className="text-green-600" />
          <span className="ml-2">Erledigt</span>
        </Button>
      ) : (
        <span className="text-muted-foreground">
          {format(resolvedAt, 'dd.MM.yyyy')} um {format(resolvedAt, 'HH:mm')}{' '}
          Uhr
        </span>
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

  const selectFilters: FacetFilter<RoomReport, unknown>[] = [
    {
      column: 'reason',
      title: 'Grund',
      options: Object.entries(REASONS).map(([value, { label, icon }]) => ({
        value,
        label,
        icon,
      })),
      mode: 'multiple',
    },
    {
      column: 'room',
      title: 'Raum',
      options: reports
        .map((report) => report.room)
        .filter((value, index, self) => self.indexOf(value) === index)
        .map((room) => ({
          value: room,
          label: room,
        })),
      mode: 'multiple',
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold">Neue Meldungen</h2>
      <DataTable
        columns={columns(dialog, router)}
        enableFilter
        enablePagination
        initialPageSize={20}
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
          selectFilters,
        }}
        tableId="roomReports-new"
        data={reports.filter((r) => r.resolvedAt === null)}
      />
      <h2 className="text-xl font-bold">Abgeschlossene Meldungen</h2>
      <DataTable
        columns={columns(dialog, router)}
        enableFilter
        enablePagination
        initialPageSize={20}
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
          selectFilters,
        }}
        tableId="roomReports-resolved"
        data={reports.filter((r) => r.resolvedAt !== null)}
      />
    </div>
  )
}
