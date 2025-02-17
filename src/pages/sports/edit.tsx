import { Button } from '@/components/ui/button'
import ConfirmDeleteDialog from '@/components/ui/dialog/confirmDeletionDialog'
import NavBar from '@/components/ui/navBar'
import PathBreadcrumbs from '@/components/ui/pathBreadcrumbs'
import SportsForm, { type SportsFormRef } from '@/components/ui/sportsForm'
import { getSportsEvents } from '@/lib/backend/client'
import type { NewSportsEvent, SportsEvent } from '@/lib/backend/sportEvents'
import { useDialogs } from '@/lib/providers/dialogsProvider'
import { Save, Trash } from 'lucide-react'
import type { GetServerSideProps } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useCallback, useRef, useState } from 'react'

interface EditSportsEventPageProps {
  event: SportsEvent
}

export default function EditSportsEventPage({
  event,
}: EditSportsEventPageProps) {
  const { setLoading, openErrorDialog } = useDialogs()
  const router = useRouter()

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

  const handleDelete = useCallback(async () => {
    setLoading(true)

    const response = await fetch('/api/sports', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: event.id,
      }),
    })

    if (!response.ok) {
      openErrorDialog('Die Veranstaltung konnte nicht gelöscht werden.')
      setLoading(false)
      return
    }

    setLoading(false)
    router.replace('/sports')
  }, [event.id, openErrorDialog, router, setLoading])

  const handleEdit = useCallback(
    async (data: NewSportsEvent) => {
      setLoading(true)

      const response = await fetch('/api/sports', {
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
        openErrorDialog('Die Veranstaltung konnte nicht gespeichert werden.')
        setLoading(false)
        return
      }

      setLoading(false)
      router.replace('/sports')
    },
    [event.id, openErrorDialog, router, setLoading]
  )

  const formRef = useRef<SportsFormRef>(null)

  return (
    <div>
      <Head>
        <title>Event bearbeiten</title>
      </Head>

      <ConfirmDeleteDialog
        open={confirmDeleteOpen}
        setOpen={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Veranstaltung löschen?"
      />

      <NavBar />
      <div className="container my-4 flex flex-col gap-3">
        <PathBreadcrumbs />

        <div className="flex flex-row items-center gap-3">
          <h1 className="mt-3 flex-1 text-4xl font-bold tracking-tight">
            Veranstaltung bearbeiten
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

        <SportsForm onSubmit={handleEdit} ref={formRef} defaultValues={event} />
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps<
  EditSportsEventPageProps
> = async ({ query }) => {
  const { id } = query
  if (typeof id !== 'string') {
    return {
      notFound: true,
    }
  }

  // Fetch the event from the backend
  const events = await getSportsEvents()
  const event = events.find((event) => event.id === id)

  if (!event) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      event,
    },
  }
}
