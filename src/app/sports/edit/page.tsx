import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getSportsEvents } from '@/lib/backend/client'
import { groups } from '@/lib/backend/groups'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import EditSportsClient from './EditSportsClient'

export default async function Page({
  searchParams,
}: { searchParams: { id?: string } }) {
  const session = await getServerSession(authOptions)
  const isAuthorized =
    session &&
    (session.user.groups.includes(groups.sports) ||
      session.user.groups.includes(groups.admin))

  if (!isAuthorized) {
    redirect('/auth/signIn')
  }

  const id = searchParams.id
  if (!id) redirect('/sports')

  const events = await getSportsEvents()
  const event = events.find((e) => e.id === id)
  if (!event) redirect('/sports')

  return <EditSportsClient event={event} />
}
