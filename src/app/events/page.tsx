import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getNeulandEvents } from '@/lib/backend/client'
import { groups } from '@/lib/backend/groups'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import EventsPageClient from './EventsPageClient'

export default async function Page() {
  const session = await getServerSession(authOptions)
  const isAuthorized =
    session &&
    (session.user.groups.includes(groups.events) ||
      session.user.groups.includes(groups.admin))

  if (!isAuthorized) {
    redirect('/auth/signIn')
  }

  const events = await getNeulandEvents()
  return <EventsPageClient events={events} />
}
