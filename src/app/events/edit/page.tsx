import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getNeulandEvents } from '@/lib/backend/client'
import { groups } from '@/lib/backend/groups'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import EditEventClient from './EditEventClient'

export default async function Page({
  searchParams,
}: { searchParams: { id?: string } }) {
  const session = await getServerSession(authOptions)
  const isAuthorized =
    session &&
    (session.user.groups.includes(groups.events) ||
      session.user.groups.includes(groups.admin))

  if (!isAuthorized) {
    redirect('/auth/signIn')
  }

  const id = searchParams.id
  if (!id) redirect('/events')

  const events = await getNeulandEvents()
  const event = events.find((e) => e.id === id)
  if (!event) redirect('/events')

  return <EditEventClient initialEvent={event} />
}
