import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import {
  newAnnouncementSchema,
  updateAnnouncementSchema,
} from '@/lib/backend/announcements'
import {
  createAnnouncement,
  deleteAnnouncement,
  updateAnnouncement,
} from '@/lib/backend/client'
import { groups } from '@/lib/backend/groups'
import type { Session } from 'next-auth'
import { getServerSession } from 'next-auth'
import { type NextRequest, NextResponse } from 'next/server'

async function isAuthorized(session: Session | null) {
  return (
    session &&
    (session.user.groups.includes(groups.sports) ||
      session.user.groups.includes(groups.admin))
  )
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!(await isAuthorized(session))) {
    return NextResponse.json({ message: 'Not authorized!' }, { status: 403 })
  }
  if (!session)
    return NextResponse.json({ message: 'Not authenticated!' }, { status: 401 })
  const body = await req.json()
  const result = await newAnnouncementSchema.safeParseAsync(body)
  if (result.error) {
    return NextResponse.json({ message: 'Invalid data!' }, { status: 400 })
  }
  await createAnnouncement(result.data, session.accessToken)
  return NextResponse.json({ message: 'Event created!' }, { status: 201 })
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!(await isAuthorized(session))) {
    return NextResponse.json({ message: 'Not authorized!' }, { status: 403 })
  }
  if (!session)
    return NextResponse.json({ message: 'Not authenticated!' }, { status: 401 })
  const body = await req.json()
  const result = await updateAnnouncementSchema.safeParseAsync(body)
  if (result.error) {
    return NextResponse.json({ message: 'Invalid data!' }, { status: 400 })
  }
  const { id, ...data } = result.data
  await updateAnnouncement(data, id, session.accessToken)
  return NextResponse.json({ message: 'Event updated!' })
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!(await isAuthorized(session))) {
    return NextResponse.json({ message: 'Not authorized!' }, { status: 403 })
  }
  if (!session)
    return NextResponse.json({ message: 'Not authenticated!' }, { status: 401 })
  const body = await req.json()
  await deleteAnnouncement(body.id, session.accessToken)
  return NextResponse.json({ message: 'Event deleted!' })
}
