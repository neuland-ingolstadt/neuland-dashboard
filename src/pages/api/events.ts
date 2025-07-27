import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import {
  createNeulandEvent,
  deleteNeulandEvent,
  updateNeulandEvent,
} from '@/lib/backend/client'
import { checkApiPermissions } from '@/lib/backend/groups'
import {
  newNeulandEventSchema,
  updateNeulandEventSchema,
} from '@/lib/backend/neulandEvents'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const authorized = await checkApiPermissions(req, res, 'events')
  if (!authorized) {
    return res.status(403).json({ message: 'Not authorized!' })
  }

  const session = await getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(401).json({ message: 'Not authenticated!' })
  }

  // create new announcement
  if (req.method === 'POST') {
    const eventData = req.body

    const result = await newNeulandEventSchema.safeParseAsync(eventData)
    if (result.error) {
      return res.status(400).json({ message: 'Invalid data!' })
    }

    await createNeulandEvent(result.data, session.accessToken)
    return res.status(201).json({ message: 'Event created!' })
  }

  // update announcement
  if (req.method === 'PUT') {
    const eventData = req.body

    const result = await updateNeulandEventSchema.safeParseAsync(eventData)
    if (result.error) {
      return res.status(400).json({ message: 'Invalid data!' })
    }

    // get data without id
    const { id, ...data } = result.data

    await updateNeulandEvent(data, id, session.accessToken)
    return res.status(200).json({ message: 'Event updated!' })
  }

  // delete sport event
  if (req.method === 'DELETE') {
    const { id } = req.body

    await deleteNeulandEvent(id, session.accessToken)
    return res.status(200).json({ message: 'Event deleted!' })
  }

  return res.status(405).json({ message: 'Method not allowed!' })
}
