import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getRoomReports } from '@/lib/backend/client'
import { groups } from '@/lib/backend/groups'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import RoomReportsClient from './RoomReportsClient'

export default async function Page() {
  const session = await getServerSession(authOptions)
  const isAuthorized =
    session &&
    (session.user.groups.includes(groups.announcements) ||
      session.user.groups.includes(groups.admin))

  if (!isAuthorized || !session) {
    redirect('/auth/signIn')
  }

  const reports = await getRoomReports(session.accessToken)
  return <RoomReportsClient reports={reports} />
}
