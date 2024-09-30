import AnnouncementsTable from '@/components/tables/announcementsTable'
import { Button } from '@/components/ui/button'
import NavBar from '@/components/ui/navBar'
import PathBreadcrumbs from '@/components/ui/pathBreadcrumbs'
import { Announcement } from '@/lib/backend/announcements'
import { getAnnouncements } from '@/lib/backend/client'
import { checkServerSidePermissions } from '@/lib/backend/groups'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'

interface AnnouncementsPageProps {
  announcements: Announcement[]
}

export default function SportsPage({ announcements }: AnnouncementsPageProps) {
  return (
    <div>
      <Head>
        <title>In-App Ankündigungen</title>
      </Head>

      <NavBar />
      <div className="container my-4 flex flex-col gap-3">
        <PathBreadcrumbs />

        <div className="flex flex-row items-center">
          <h1 className="mt-3 flex-1 text-4xl font-bold tracking-tight">
            In-App Ankündigungen
          </h1>

          <Link
            href="/announcements/new"
            passHref
          >
            <Button>Neue Ankündigung</Button>
          </Link>
        </div>

        <AnnouncementsTable announcement={announcements} />
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps<
  AnnouncementsPageProps
> = async (ctx) => {
  const authorized = await checkServerSidePermissions(ctx, 'announcements')
  if (!authorized) {
    return {
      redirect: {
        destination: '/auth/signIn',
        permanent: false,
      },
    }
  }

  const announcements = await getAnnouncements()

  return {
    props: {
      announcements,
    },
  }
}
