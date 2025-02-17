import {
  newAnnouncementSchema,
  updateAnnouncementSchema,
} from '@/lib/backend/announcements'
import {
  createAnnouncement,
  deleteAnnouncement,
  updateAnnouncement,
} from '@/lib/backend/client'
import { checkApiPermissions } from '@/lib/backend/groups'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
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

  // create new announcement
  if (req.method === 'POST') {
    const announcementData = req.body

    const result = await newAnnouncementSchema.safeParseAsync(announcementData)
    if (result.error) {
      return res.status(400).json({ message: 'Invalid data!' })
    }

    await createAnnouncement(result.data, session.accessToken)
    return res.status(201).json({ message: 'Event created!' })
  }

  // update announcement
  if (req.method === 'PUT') {
    const announcementData = req.body

    const result =
      await updateAnnouncementSchema.safeParseAsync(announcementData)
    if (result.error) {
      return res.status(400).json({ message: 'Invalid data!' })
    }

    // get data without id
    const { id, ...data } = result.data

    await updateAnnouncement(data, id, session.accessToken)
    return res.status(200).json({ message: 'Event updated!' })
  }

  // delete sport event
  if (req.method === 'DELETE') {
    const { id } = req.body

    await deleteAnnouncement(id, session.accessToken)
    return res.status(200).json({ message: 'Event deleted!' })
  }

  return res.status(405).json({ message: 'Method not allowed!' })
}
