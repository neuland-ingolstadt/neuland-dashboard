import SportsEventsTable from '@/components/tables/sportsEventsTable'
import { Button } from '@/components/ui/button'
import NavBar from '@/components/ui/navBar'
import PathBreadcrumbs from '@/components/ui/pathBreadcrumbs'
import { getSportsEvents } from '@/lib/backend/client'
import { checkServerSidePermissions } from '@/lib/backend/groups'
import type { SportsEvent } from '@/lib/backend/sportEvents'
import type { GetServerSideProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'

interface SportsPageProps {
  events: SportsEvent[]
}

export default function SportsPage({ events }: SportsPageProps) {
  return (
    <div>
      <Head>
        <title>Hochschulsport</title>
      </Head>

      <NavBar />
      <div className="container my-4 flex flex-col gap-3">
        <PathBreadcrumbs />

        <div className="flex flex-row items-center">
          <h1 className="mt-3 flex-1 text-4xl font-bold tracking-tight">
            Hochschulsport
          </h1>

          <Link href="/sports/new" passHref>
            <Button>Neue Veranstaltung</Button>
          </Link>
        </div>

        <SportsEventsTable events={events} />
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps<SportsPageProps> = async (
  ctx
) => {
  const authorized = await checkServerSidePermissions(ctx, 'sports')
  if (!authorized) {
    return {
      redirect: {
        destination: '/auth/signIn',
        permanent: false,
      },
    }
  }

  const events = await getSportsEvents()

  return {
    props: {
      events,
    },
  }
}
