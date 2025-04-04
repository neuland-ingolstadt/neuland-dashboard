import { authOptions } from '@/pages/api/auth/[...nextauth]'
import type {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from 'next'
import { getServerSession } from 'next-auth'
import { getSession } from 'next-auth/react'

export const groups = {
  next: 'Neuland Next',
  sports: 'Neuland Next Hochschulsport',
  announcements: 'Neuland Next Announcements',
  admin: 'Neuland Next Admin',
  events: 'Neuland Next Events',
} as const

export type Group = keyof typeof groups

export async function checkApiPermissions(
  req: NextApiRequest,
  res: NextApiResponse,
  ...requiredGroups: Group[]
) {
  const session = await getServerSession(req, res, authOptions)

  if (!session) {
    return false
  }

  return (
    requiredGroups.every((group) =>
      session.user.groups.includes(groups[group])
    ) || session.user.groups.includes(groups.admin)
  )
}

export async function checkServerSidePermissions(
  context: GetServerSidePropsContext,
  ...requiredGroups: Group[]
) {
  const session = await getSession(context)

  if (!session) {
    return false
  }

  return (
    requiredGroups.every((group) =>
      session.user.groups.includes(groups[group])
    ) || session.user.groups.includes(groups.admin)
  )
}
