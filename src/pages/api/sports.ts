import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import {
  createSportsEvent,
  deleteSportsEvent,
  updateSportsEvent,
} from '@/lib/backend/client'
import { checkApiPermissions } from '@/lib/backend/groups'
import {
  newSportsEventSchema,
  updateSportsEventSchema,
} from '@/lib/backend/sportEvents'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const authorized = await checkApiPermissions(req, res, 'sports')
  if (!authorized) {
    return res.status(403).json({ message: 'Not authorized!' })
  }

  const session = await getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(401).json({ message: 'Not authenticated!' })
  }

  // create new sport event
  if (req.method === 'POST') {
    const eventData = req.body

    const result = await newSportsEventSchema.safeParseAsync(eventData)
    if (result.error) {
      return res.status(400).json({ message: 'Invalid data!' })
    }

    await createSportsEvent(result.data, session.accessToken)
    return res.status(201).json({ message: 'Event created!' })
  }

  // update sport event
  if (req.method === 'PUT') {
    const eventData = req.body

    const result = await updateSportsEventSchema.safeParseAsync(eventData)
    if (result.error) {
      return res.status(400).json({ message: 'Invalid data!' })
    }

    // get data without id
    const { id, ...data } = result.data

    await updateSportsEvent(data, id, session.accessToken)
    return res.status(200).json({ message: 'Event updated!' })
  }

  // delete sport event
  if (req.method === 'DELETE') {
    const { id } = req.body

    await deleteSportsEvent(id, session.accessToken)
    return res.status(200).json({ message: 'Event deleted!' })
  }

  return res.status(405).json({ message: 'Method not allowed!' })
}
