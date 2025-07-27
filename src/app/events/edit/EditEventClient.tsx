'use client'
import { Button } from '@/components/ui/button'
import ConfirmDeleteDialog from '@/components/ui/dialog/confirmDeletionDialog'
import NavBar from '@/components/ui/navBar'
import NeulandEventForm, {
  type NeulandEventFormRef,
} from '@/components/ui/neulandEventForm'
import PathBreadcrumbs from '@/components/ui/pathBreadcrumbs'
import { getNeulandEvents } from '@/lib/backend/client'
import type { NeulandEvent, NewNeulandEvent } from '@/lib/backend/neulandEvents'
import { useDialogs } from '@/lib/providers/dialogsProvider'
import { Save, Trash } from 'lucide-react'
import type { GetServerSideProps } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/navigation'
import { useCallback, useMemo, useRef, useState } from 'react'

interface EditNeulandEventPageProps {
  initialEvent: NeulandEvent
}

export default function EditNeulandEventPage({
  initialEvent,
}: EditNeulandEventPageProps) {
  const event = useMemo(
    () => ({
      ...initialEvent,
      startTime: initialEvent.startTime
        ? new Date(initialEvent.startTime)
        : null,
      endTime: initialEvent.endTime ? new Date(initialEvent.endTime) : null,
    }),
    [initialEvent]
  )
  const { setLoading, openErrorDialog } = useDialogs()
  const router = useRouter()

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

  const handleDelete = useCallback(async () => {
    setLoading(true)

    const response = await fetch('/api/events', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: event.id,
      }),
    })

    if (!response.ok) {
      openErrorDialog('Das Event konnte nicht gelöscht werden.')
      setLoading(false)
      return
    }

    setLoading(false)
    router.replace('/events')
  }, [event.id, openErrorDialog, router, setLoading])

  const handleEdit = useCallback(
    async (data: NewNeulandEvent) => {
      setLoading(true)

      const response = await fetch('/api/events', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          id: event.id,
        }),
      })

      if (!response.ok) {
        openErrorDialog('Das Event konnte nicht gespeichert werden.')
        setLoading(false)
        return
      }

      setLoading(false)
      router.replace('/events')
    },
    [event.id, openErrorDialog, router, setLoading]
  )

  const formRef = useRef<NeulandEventFormRef>(null)

  return (
    <div>
      <Head>
        <title>Event bearbeiten</title>
      </Head>

      <ConfirmDeleteDialog
        open={confirmDeleteOpen}
        setOpen={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Event löschen?"
      />

      <NavBar />
      <div className="container my-4 flex flex-col gap-3">
        <PathBreadcrumbs />

        <div className="flex flex-row items-center gap-3">
          <h1 className="mt-3 flex-1 text-4xl font-bold tracking-tight">
            Event bearbeiten
          </h1>

          <Button
            onClick={() => setConfirmDeleteOpen(true)}
            size="icon"
            variant="destructive"
          >
            <Trash size={16} />
          </Button>

          <Button onClick={() => formRef.current?.triggerSubmit()}>
            <Save className="mr-2" size={16} />
            <span>Speichern</span>
          </Button>
        </div>
        <NeulandEventForm
          onSubmit={handleEdit}
          ref={formRef}
          existingEvent={event}
        />
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps<
  EditNeulandEventPageProps
> = async ({ query }) => {
  const { id } = query
  if (typeof id !== 'string') {
    return {
      notFound: true,
    }
  }

  const events = await getNeulandEvents()
  const event = events.find((event) => event.id === id)

  if (!event) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      initialEvent: event,
    },
  }
}
