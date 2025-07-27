import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getAuditLog } from '@/lib/backend/client'
import { groups } from '@/lib/backend/groups'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import AuditLogClient from './AuditLogClient'

export default async function Page() {
  const session = await getServerSession(authOptions)
  const isAuthorized = session?.user.groups.includes(groups.admin)

  if (!isAuthorized || !session) {
    redirect('/auth/signIn')
  }

  const entries = await getAuditLog(session.accessToken)
  return <AuditLogClient entries={entries} />
}
