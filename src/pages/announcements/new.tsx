import AnnouncementsForm from '@/components/ui/announcementForm'
import { Button } from '@/components/ui/button'
import NavBar from '@/components/ui/navBar'
import PathBreadcrumbs from '@/components/ui/pathBreadcrumbs'
import type { SportsFormRef } from '@/components/ui/sportsForm'
import type { NewAnnouncement } from '@/lib/backend/announcements'
import { useDialogs } from '@/lib/providers/dialogsProvider'
import { Save } from 'lucide-react'
import Head from 'next/head'
import { useRouter } from 'next/navigation'
import { useCallback, useRef } from 'react'

export default function NewSportsEventPage() {
  const { setLoading, openErrorDialog } = useDialogs()
  const router = useRouter()

  const handleSave = useCallback(
    async (data: NewAnnouncement) => {
      setLoading(true)
      const response = await fetch('/api/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        openErrorDialog('Die Ankündigung konnte nicht gespeichert werden.')
        setLoading(false)
        return
      }

      setLoading(false)
      router.replace('/announcements')
    },
    [openErrorDialog, router, setLoading]
  )

  const formRef = useRef<SportsFormRef>(null)

  return (
    <div>
      <Head>
        <title>Neue Ankündigung</title>
      </Head>

      <NavBar />
      <div className="container my-4 flex flex-col gap-3">
        <PathBreadcrumbs />

        <div className="flex flex-row items-center">
          <h1 className="mt-3 flex-1 text-4xl font-bold tracking-tight">
            Neue Ankündigung
          </h1>

          <Button onClick={() => formRef.current?.triggerSubmit()}>
            <Save className="mr-2" size={16} />
            <span>Speichern</span>
          </Button>
        </div>

        <AnnouncementsForm onSubmit={handleSave} ref={formRef} />
      </div>
    </div>
  )
}
