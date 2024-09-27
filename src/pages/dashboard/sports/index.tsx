import SportsEventsTable from '@/components/tables/sportsEventsTable'
import { Button } from '@/components/ui/button'
import NavBar from '@/components/ui/navBar'
import PathBreadcrumbs from '@/components/ui/pathBreadcrumbs'
import { getSportsEvents } from '@/lib/backend/client'
import { SportsEvent } from '@/lib/backend/sportEvents'
import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import Link from 'next/link'

interface SportsPageProps {
  events: SportsEvent[]
}

export default function SportsPage({ events }: SportsPageProps) {
  return (
    <div>
      <NavBar />
      <div className="container my-4 flex flex-col gap-3">
        <PathBreadcrumbs />

        <div className="flex flex-row items-center">
          <h1 className="mt-3 flex-1 text-4xl font-bold tracking-tight">
            Hochschulsport
          </h1>

          <Link
            href="/dashboard/sports/new"
            passHref
          >
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
  const session = await getSession(ctx)

  if (!session) {
    return {
      redirect: {
        destination: '/',
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
