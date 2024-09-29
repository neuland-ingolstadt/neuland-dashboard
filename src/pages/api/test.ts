import { getSportsEvents, graphqlClient } from '@/lib/backend/client'
import { checkApiPermissions } from '@/lib/backend/groups'
import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const authorized = await checkApiPermissions(req, res, 'sports')
  if (!authorized) {
    return res.status(403).json({ message: 'Not authorized!' })
  }

  const session = (await getSession({ req }))!
  console.log(session)

  graphqlClient.setHeader('Authorization', `Bearer ${session.accessToken}`)
  const data = await getSportsEvents()

  return res.status(200).json({ data })
}
