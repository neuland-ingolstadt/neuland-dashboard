import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'

export const groups = {
  next: 'Neuland Next',
  sports: 'Neuland Next Hochschulsport',
  announcements: 'Neuland Next Announcements',
} as const

export type Group = keyof typeof groups

export async function checkPermissions(
  req: NextApiRequest,
  res: NextApiResponse,
  ...requiredGroups: Group[]
) {
  const session = await getServerSession(req, res, authOptions)

  if (!session) {
    return false
  }

  return requiredGroups.every((group) =>
    session.user.groups.includes(groups[group])
  )
}
