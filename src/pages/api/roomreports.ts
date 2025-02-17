import { resolveRoomReport } from '@/lib/backend/client'
import { checkApiPermissions } from '@/lib/backend/groups'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const authorized = await checkApiPermissions(req, res, 'admin')
  if (!authorized) {
    return res.status(403).json({ message: 'Not authorized!' })
  }

  const session = await getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(401).json({ message: 'Not authenticated!' })
  }

  // mark report as read
  if (req.method === 'DELETE') {
    const { id } = req.body

    await resolveRoomReport(id, session.accessToken)
    return res.status(200).json({ message: 'Report completed!' })
  }

  return res.status(405).json({ message: 'Method not allowed!' })
}
