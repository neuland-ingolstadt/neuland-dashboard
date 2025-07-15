import AuditLogTable from '@/components/tables/auditLogTable'
import NavBar from '@/components/ui/navBar'
import PathBreadcrumbs from '@/components/ui/pathBreadcrumbs'
import type { AuditLogEntry } from '@/lib/backend/auditLog'
import { getAuditLog } from '@/lib/backend/client'
import { checkServerSidePermissions } from '@/lib/backend/groups'
import type { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import Head from 'next/head'

interface AuditLogPageProps {
  entries: AuditLogEntry[]
}

export default function AuditLogPage({ entries }: AuditLogPageProps) {
  return (
    <div>
      <Head>
        <title>Audit Log</title>
      </Head>

      <NavBar />
      <div className="container my-4 flex flex-col gap-3">
        <PathBreadcrumbs />

        <div className="flex flex-row items-center">
          <h1 className="mt-3 flex-1 text-4xl font-bold tracking-tight">
            Audit Log
          </h1>
        </div>

        <AuditLogTable entries={entries} />
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps<AuditLogPageProps> = async (
  ctx
) => {
  const session = await getSession(ctx)
  const authorized = await checkServerSidePermissions(ctx, 'admin')
  if (!authorized || !session) {
    return {
      redirect: {
        destination: '/auth/signIn',
        permanent: false,
      },
    }
  }

  const entries = await getAuditLog(session.accessToken)
  return {
    props: {
      entries,
    },
  }
}
