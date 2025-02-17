import RoomReportsTable from '@/components/tables/roomReportsTable'
import NavBar from '@/components/ui/navBar'
import PathBreadcrumbs from '@/components/ui/pathBreadcrumbs'
import { getRoomReports } from '@/lib/backend/client'
import { checkServerSidePermissions } from '@/lib/backend/groups'
import type { RoomReport } from '@/lib/backend/rootReports'
import type { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import Head from 'next/head'

interface RoomReportsProps {
  reports: RoomReport[]
}

export default function RoomReportsPage({ reports }: RoomReportsProps) {
  return (
    <div>
      <Head>
        <title>Meldungen für falsch eingetragene Rauminfos.</title>
      </Head>

      <NavBar />
      <div className="container my-4 flex flex-col gap-3">
        <PathBreadcrumbs />

        <div className="flex flex-row items-center">
          <h1 className="mt-3 flex-1 text-4xl font-bold tracking-tight">
            Meldungen für falsch eingetragene Rauminfos.
          </h1>
        </div>

        <RoomReportsTable reports={reports} />
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps<RoomReportsProps> = async (
  ctx
) => {
  const session = await getSession(ctx)
  const authorized = await checkServerSidePermissions(ctx, 'announcements')
  if (!authorized || !session) {
    return {
      redirect: {
        destination: '/auth/signIn',
        permanent: false,
      },
    }
  }

  const reports = await getRoomReports(session.accessToken)
  return {
    props: {
      reports,
    },
  }
}
