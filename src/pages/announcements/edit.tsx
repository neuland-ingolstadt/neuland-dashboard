import AnnouncementForm, {
  AnnouncementFormRef,
} from '@/components/ui/announcementForm'
import { Button } from '@/components/ui/button'
import ConfirmDeleteDialog from '@/components/ui/dialog/confirmDeletionDialog'
import NavBar from '@/components/ui/navBar'
import PathBreadcrumbs from '@/components/ui/pathBreadcrumbs'
import { Announcement, NewAnnouncement } from '@/lib/backend/announcements'
import { getAnnouncements } from '@/lib/backend/client'
import { useDialogs } from '@/lib/providers/dialogsProvider'
import { Save, Trash } from 'lucide-react'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useCallback, useMemo, useRef, useState } from 'react'

interface EditAnnouncementPageProps {
  initialAnnouncement: Announcement
}

export default function EditAnnouncementEventPage({
  initialAnnouncement,
}: EditAnnouncementPageProps) {
  const announcement = useMemo(
    () => ({
      ...initialAnnouncement,
      startDateTime: new Date(initialAnnouncement.startDateTime),
      endDateTime: new Date(initialAnnouncement.endDateTime),
    }),
    [initialAnnouncement]
  )
  const { setLoading, openErrorDialog } = useDialogs()
  const router = useRouter()

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

  const handleDelete = useCallback(async () => {
    setLoading(true)

    const response = await fetch(`/api/announcements`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: announcement.id,
      }),
    })

    if (!response.ok) {
      openErrorDialog('Die Veranstaltung konnte nicht gelöscht werden.')
      setLoading(false)
      return
    }

    setLoading(false)
    router.replace('/announcements')
  }, [announcement.id, openErrorDialog, router, setLoading])

  const handleEdit = useCallback(
    async (data: NewAnnouncement) => {
      setLoading(true)

      const response = await fetch('/api/announcements', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          id: announcement.id,
        }),
      })

      if (!response.ok) {
        openErrorDialog('Die Veranstaltung konnte nicht gespeichert werden.')
        setLoading(false)
        return
      }

      setLoading(false)
      router.replace('/announcements')
    },
    [announcement.id, openErrorDialog, router, setLoading]
  )

  const formRef = useRef<AnnouncementFormRef>(null)

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
            Ankündigung bearbeiten
          </h1>

          <Button
            onClick={() => setConfirmDeleteOpen(true)}
            size="icon"
            variant="destructive"
          >
            <Trash size={16} />
          </Button>

          <Button onClick={() => formRef.current?.triggerSubmit()}>
            <Save
              className="mr-2"
              size={16}
            />
            <span>Speichern</span>
          </Button>
        </div>

        <AnnouncementForm
          onSubmit={handleEdit}
          ref={formRef}
          defaultValues={announcement}
        />
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps<
  EditAnnouncementPageProps
> = async ({ query }) => {
  const { id } = query
  if (typeof id !== 'string') {
    return {
      notFound: true,
    }
  }

  const announcements = await getAnnouncements()
  const announcement = announcements.find(
    (announcement) => announcement.id === id
  )

  if (!announcement) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      initialAnnouncement: announcement,
    },
  }
}
