import { checkApiPermissions } from '@/lib/backend/groups'
import {
  extractFilenameFromKey,
  getS3PublicUrl,
  listS3Objects,
} from '@/lib/backend/s3Client'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import type { ApiResponse } from '@/types/api'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'

export interface ListedImage {
  name: string
  url: string
  size?: number
  uploadedAt?: string
}

export type ImageListSuccessResponse = ListedImage[]

type ImageListApiResponse = ApiResponse<ImageListSuccessResponse | null>

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
    const s3Objects = await listS3Objects('uploads/')
    const images: ListedImage[] = []

    for (const obj of s3Objects) {
      if (!obj.Key) continue

      const isImage = /\.(jpeg|jpg|png|gif|webp)$/i.test(obj.Key)

      if (isImage) {
        const filename = extractFilenameFromKey(obj.Key)
        const url = getS3PublicUrl(obj.Key)

        images.push({
          name: filename,
          url,
          size: obj.Size,
          uploadedAt: obj.LastModified?.toISOString(),
        })
      }
    }

    images.sort((a, b) => {
      if (!a.uploadedAt && !b.uploadedAt) return 0
      if (!a.uploadedAt) return 1
      if (!b.uploadedAt) return -1
      return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    })

    return res.status(200).json({ success: true, data: images })
  } catch (error: unknown) {
    console.error('Error listing images from S3:', error)

    return res.status(500).json({
      success: false,
      error: {
        message:
          error instanceof Error
            ? error.message
            : 'Failed to list images from S3',
        code: 'SERVER_ERROR',
      },
    })
  }
}
