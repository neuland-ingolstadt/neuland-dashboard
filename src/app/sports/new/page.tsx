'use client'
import { Button } from '@/components/ui/button'
import NavBar from '@/components/ui/navBar'
import PathBreadcrumbs from '@/components/ui/pathBreadcrumbs'
import SportsForm, { type SportsFormRef } from '@/components/ui/sportsForm'
import type { NewSportsEvent } from '@/lib/backend/sportEvents'
import { useDialogs } from '@/lib/providers/dialogsProvider'
import { Save } from 'lucide-react'
import Head from 'next/head'
import { useRouter } from 'next/navigation'
import { useCallback, useRef } from 'react'

export default function NewSportsEventPage() {
  const { setLoading, openErrorDialog } = useDialogs()
  const router = useRouter()

  const handleSave = useCallback(
    async (data: NewSportsEvent) => {
      setLoading(true)

      const response = await fetch('/api/sports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        openErrorDialog('Die Veranstaltung konnte nicht gespeichert werden.')
        setLoading(false)
        return
      }

      setLoading(false)
      router.replace('/sports')
    },
    [openErrorDialog, router, setLoading]
  )

  const formRef = useRef<SportsFormRef>(null)

  return (
    <div>
      <Head>
        <title>Neue Veranstaltung</title>
      </Head>

      <NavBar />
      <div className="container my-4 flex flex-col gap-3">
        <PathBreadcrumbs />

        <div className="flex flex-row items-center">
          <h1 className="mt-3 flex-1 text-4xl font-bold tracking-tight">
            Neue Veranstaltung
          </h1>

          <Button onClick={() => formRef.current?.triggerSubmit()}>
            <Save className="mr-2" size={16} />
            <span>Speichern</span>
          </Button>
        </div>

        <SportsForm onSubmit={handleSave} ref={formRef} />
      </div>
    </div>
  )
}
