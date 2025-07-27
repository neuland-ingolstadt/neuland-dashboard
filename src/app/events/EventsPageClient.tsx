'use client'
import NeulandEventsTable from '@/components/tables/neulandEventsTable'
import { Button } from '@/components/ui/button'
import NavBar from '@/components/ui/navBar'
import PathBreadcrumbs from '@/components/ui/pathBreadcrumbs'
import { getNeulandEvents } from '@/lib/backend/client'
import { checkServerSidePermissions } from '@/lib/backend/groups'
import type { NeulandEvent } from '@/lib/backend/neulandEvents'
import type { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import Head from 'next/head'
import Link from 'next/link'

interface NeulandEventsPageProps {
  events: NeulandEvent[]
}

export default function NeulandEventsPage({ events }: NeulandEventsPageProps) {
  return (
    <div>
      <Head>
        <title>Neuland Events</title>
      </Head>

      <NavBar />
      <div className="container my-4 flex flex-col gap-3">
        <PathBreadcrumbs />

        <div className="flex flex-row items-center">
          <h1 className="mt-3 flex-1 text-4xl font-bold tracking-tight">
            Neuland Events
          </h1>

          <Link href="/events/new" passHref>
            <Button>Neues Event</Button>
          </Link>
        </div>

        <NeulandEventsTable events={events} />
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps<
  NeulandEventsPageProps
> = async (ctx) => {
  const session = await getSession(ctx)
  const authorized = await checkServerSidePermissions(ctx, 'events')
  if (!authorized || !session) {
    return {
      redirect: {
        destination: '/auth/signIn',
        permanent: false,
      },
    }
  }

  const events = await getNeulandEvents()
  return {
    props: {
      events,
    },
  }
}
