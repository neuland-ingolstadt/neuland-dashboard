import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getAnnouncements } from '@/lib/backend/client'
import { groups } from '@/lib/backend/groups'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import EditAnnouncementPage from './EditAnnouncementClient'

export default async function Page({
  searchParams,
}: { searchParams: { id?: string } }) {
  const session = await getServerSession(authOptions)
  const isAuthorized =
    session &&
    (session.user.groups.includes(groups.announcements) ||
      session.user.groups.includes(groups.admin))

  if (!isAuthorized) {
    redirect('/auth/signIn')
  }

  const id = searchParams.id
  if (!id) {
    redirect('/announcements')
  }

  const announcements = await getAnnouncements()
  const announcement = announcements.find((a) => a.id === id)
  if (!announcement) {
    redirect('/announcements')
  }

  return <EditAnnouncementPage initialAnnouncement={announcement} />
}
