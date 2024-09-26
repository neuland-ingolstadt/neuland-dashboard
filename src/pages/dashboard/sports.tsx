import SportsEventsTable from '@/components/tables/sportsEvents'
import NavBar from '@/components/ui/nav-bar'
import PathBreadcrumbs from '@/components/ui/path-breadcrumbs'
import { getSportEvents } from '@/lib/backend/client'
import { SportsEvent } from '@/lib/backend/sportEvents'
import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'

interface SportsPageProps {
  events: SportsEvent[]
}

export default function SportsPage({ events }: SportsPageProps) {
  return (
    <div>
      <NavBar />
      <div className="container my-4 flex flex-col gap-3">
        <PathBreadcrumbs />

        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Hochschulsport
        </h1>

        <SportsEventsTable events={events} />
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps<SportsPageProps> = async (
  ctx
) => {
  const session = await getSession(ctx)

  console.log(session)

  if (!session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }

  const events = await getSportEvents()

  return {
    props: {
      events,
    },
  }
}
