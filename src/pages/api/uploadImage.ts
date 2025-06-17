import type { NextApiRequest, NextApiResponse } from 'next'
import formidable, {
  type File as FormidableFile,
  errors as formidableErrors,
} from 'formidable'
import path from 'node:path'
import fs from 'node:fs/promises'
import { checkApiPermissions } from '@/lib/backend/groups'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import type {
  ApiResponse,
  FileUploadErrorCode,
  UploadedFile,
  UploadSuccessResponse,
} from '@/types/api'

export const config = {
  api: {
    bodyParser: false,
  },
}

const UPLOAD_DIR: string = path.join(process.cwd(), 'public/uploads')
const MAX_FILE_SIZE_MB: number = 5
const MAX_FILE_SIZE_BYTES: number = MAX_FILE_SIZE_MB * 1024 * 1024
const ALLOWED_MIME_TYPES: string[] = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
]

async function ensureUploadDir(): Promise<void> {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true })
  } catch (error: unknown) {
    console.error('Failed to create upload directory:', error)
    throw new Error(
      'Server configuration error: Upload directory could not be created.'
    )
  }
}

type UploadImageApiResponse = ApiResponse<UploadSuccessResponse | null>

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UploadImageApiResponse>
): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
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
    await ensureUploadDir()
  } catch (err: unknown) {
    console.error(err)
    return res.status(500).json({
      success: false,
      error: {
        message:
          err instanceof Error ? err.message : 'Server configuration error.',
        code: 'SERVER_ERROR',
      },
    })
  }

  const form = formidable({
    uploadDir: UPLOAD_DIR,
    keepExtensions: true,
    maxFileSize: MAX_FILE_SIZE_BYTES,
  })

  try {
    const [_, files] = await new Promise<[formidable.Fields, formidable.Files]>(
      (resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) {
            reject(err)
            return
          }
          resolve([fields, files])
        })
      }
    )

    const uploadedFiles = files.image as FormidableFile[] | undefined

    if (!uploadedFiles || uploadedFiles.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'No file uploaded',
          code: 'NO_FILE_UPLOADED',
        },
      })
    }

    const file: FormidableFile = uploadedFiles[0]

    if (file.size > MAX_FILE_SIZE_BYTES) {
      await fs
        .unlink(file.filepath)
        .catch((e: unknown) =>
          console.error(`Failed to delete oversized file: ${file.filepath}`, e)
        )
      return res.status(413).json({
        success: false,
        error: {
          message: `File size exceeds the limit of ${MAX_FILE_SIZE_MB}MB`,
          code: 'FILE_TOO_LARGE',
          details: {
            actualSize: file.size,
            maxSize: MAX_FILE_SIZE_BYTES,
          },
        },
      })
    }

    if (!file.mimetype || !ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      await fs
        .unlink(file.filepath)
        .catch((e: unknown) =>
          console.error(
            `Failed to delete invalid type file: ${file.filepath}`,
            e
          )
        )
      return res.status(400).json({
        success: false,
        error: {
          message:
            'Invalid file type. Only JPEG, PNG, GIF, WEBP images are allowed.',
          code: 'INVALID_FILE_TYPE',
          details: {
            mimetype: file.mimetype,
          },
        },
      })
    }

    const relativePath: string = path.relative(
      path.join(process.cwd(), 'public'),
      file.filepath
    )
    const imageUrl: string = `/${relativePath.replace(/\\/g, '/')}`

    const uploadedFileInfo: UploadedFile = {
      filepath: file.filepath,
      originalFilename: file.originalFilename,
      newFilename: file.newFilename,
      mimetype: file.mimetype,
      size: file.size,
    }

    console.log('File uploaded successfully:', uploadedFileInfo)

    return res.status(200).json({
      success: true,
      data: {
        imageUrl,
        filename:
          uploadedFileInfo.originalFilename || uploadedFileInfo.newFilename,
        size: uploadedFileInfo.size,
      },
    })
  } catch (err: unknown) {
    console.error('File upload error:', err)

    let errorMessage = 'An unexpected error occurred during file upload.'
    let errorCode: FileUploadErrorCode = 'UPLOAD_FAILED'
    let statusCode = 500
    let errorDetails: Record<string, unknown> | undefined

    if (err instanceof formidableErrors.FormidableError) {
      if (err.httpCode === 413 || err.message.includes('maxFileSize')) {
        errorMessage = `File size exceeds the limit of ${MAX_FILE_SIZE_MB}MB`
        errorCode = 'FILE_TOO_LARGE'
        statusCode = 413
        errorDetails = { maxSize: MAX_FILE_SIZE_BYTES }
      } else if (err.message.includes('missing content-type boundary')) {
        errorMessage = 'Missing content type or boundary for file upload.'
        errorCode = 'UPLOAD_FAILED'
        statusCode = 400
      } else {
        errorMessage = err.message
        statusCode = err.httpCode || 500
      }
    } else {
      if (err instanceof Error) {
        errorMessage = err.message
      }
      errorCode = 'SERVER_ERROR'
      statusCode = 500
    }

    return res.status(statusCode).json({
      success: false,
      error: {
        message: errorMessage,
        code: errorCode,
        details: errorDetails,
      },
    })
  }
}
