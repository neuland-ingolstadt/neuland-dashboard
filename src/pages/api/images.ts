import type { NextApiRequest, NextApiResponse } from 'next'
import path from 'node:path'
import fs from 'node:fs/promises'
import { checkApiPermissions } from '@/lib/backend/groups'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import type { ApiResponse } from '@/types/api'

export interface ListedImage {
  name: string
  url: string
  size?: number
  uploadedAt?: string
}

export type ImageListSuccessResponse = ListedImage[]

type ImageListApiResponse = ApiResponse<ImageListSuccessResponse | null>

const UPLOADS_PUBLIC_DIR = path.join(process.cwd(), 'public/uploads')
const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ImageListApiResponse>
): Promise<void> {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({
      success: false,
      error: {
        message: `Method ${req.method} Not Allowed`,
        code: 'METHOD_NOT_ALLOWED',
      },
    })
  }

  const authorized: boolean = await checkApiPermissions(
    req,
    res,
    'announcements'
  )
  if (!authorized) {
    return res.status(403).json({
      success: false,
      error: { message: 'Not authorized!', code: 'UNAUTHORIZED' },
    })
  }

  const session = await getServerSession(req, res, authOptions)
  if (!session) {
    return res.status(401).json({
      success: false,
      error: { message: 'Not authenticated!', code: 'UNAUTHORIZED' },
    })
  }

  try {
    const files = await fs.readdir(UPLOADS_PUBLIC_DIR)
    const images: ListedImage[] = []

    for (const file of files) {
      const filePath = path.join(UPLOADS_PUBLIC_DIR, file)
      const stat = await fs.stat(filePath)

      const isImage = /\.(jpeg|jpg|png|gif|webp)$/i.test(file)
      const url = new URL(`/uploads/${file}`, BASE_URL).toString()

      if (stat.isFile() && isImage) {
        images.push({
          name: file,
          url,
          size: stat.size,
          uploadedAt: stat.mtime.toISOString(),
        })
      }
    }

    return res.status(200).json({ success: true, data: images })
  } catch (error: unknown) {
    console.error('Error listing images:', error)
    if (
      error instanceof Error &&
      (error as NodeJS.ErrnoException).code === 'ENOENT'
    ) {
      return res.status(200).json({ success: true, data: [] })
    }
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to list images.', code: 'SERVER_ERROR' },
    })
  }
}
