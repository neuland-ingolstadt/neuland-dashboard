import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { resolveRoomReport } from '@/lib/backend/client'
import { groups } from '@/lib/backend/groups'
import type { Session } from 'next-auth'
import { getServerSession } from 'next-auth'
import { type NextRequest, NextResponse } from 'next/server'

async function isAuthorized(session: Session | null) {
  return session?.user.groups.includes(groups.admin)
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!(await isAuthorized(session))) {
    return NextResponse.json({ message: 'Not authorized!' }, { status: 403 })
  }
  if (!session)
    return NextResponse.json({ message: 'Not authenticated!' }, { status: 401 })
  const body = await req.json()
  await resolveRoomReport(body.id, session.accessToken)
  return NextResponse.json({ message: 'Report completed!' })
}
