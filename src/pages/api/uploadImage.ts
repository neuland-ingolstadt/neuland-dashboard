import { randomUUID } from 'node:crypto'
import fs from 'node:fs/promises'
import os from 'node:os'
import { checkApiPermissions } from '@/lib/backend/groups'
import { generateS3Key, uploadToS3 } from '@/lib/backend/s3Client'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import type {
  ApiResponse,
  FileUploadErrorCode,
  UploadSuccessResponse,
  UploadedFile,
} from '@/types/api'
import formidable, {
  type File as FormidableFile,
  errors as formidableErrors,
} from 'formidable'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import sharp from 'sharp'

export const config = {
  api: {
    bodyParser: false,
  },
}

const MAX_FILE_SIZE_MB = 10
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
const TEMP_DIR = os.tmpdir()

const ALLOWED_MIME_TYPES: string[] = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/tiff',
  'image/bmp',
  'image/svg+xml',
  'image/avif',
  'image/heic',
  'image/heif',
]

type UploadedFileWithId = UploadedFile & { id: string }
type UploadSuccessResponseWithId = UploadSuccessResponse & { id: string }
type UploadImageApiResponse = ApiResponse<UploadSuccessResponseWithId | null>

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

  const form = formidable({
    uploadDir: TEMP_DIR,
    keepExtensions: false,
    maxFileSize: MAX_FILE_SIZE_BYTES,
  })

  let tempFilePath: string | undefined
  let fileId: string | undefined

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
    tempFilePath = file.filepath

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
            'Invalid file type. Only common image formats (JPEG, PNG, GIF, WEBP etc.) are allowed.',
          code: 'INVALID_FILE_TYPE',
          details: {
            mimetype: file.mimetype,
          },
        },
      })
    }

    fileId = randomUUID()
    const originalFilename = file.originalFilename || `upload-${fileId}`
    const s3Key = generateS3Key(originalFilename, fileId)

    let webpBuffer: Buffer
    try {
      webpBuffer = await sharp(file.filepath).webp({ quality: 80 }).toBuffer()

      await fs.unlink(file.filepath)
    } catch (conversionError: unknown) {
      console.error('Sharp conversion error:', conversionError)
      if (tempFilePath) {
        await fs.unlink(tempFilePath).catch(() => {})
      }
      return res.status(500).json({
        success: false,
        error: {
          message: 'Image conversion to WebP failed.',
          code: 'IMAGE_CONVERSION_FAILED',
          details: {
            error:
              conversionError instanceof Error
                ? conversionError.message
                : 'Unknown conversion error',
          },
        },
      })
    }

    let imageUrl: string
    try {
      imageUrl = await uploadToS3(s3Key, webpBuffer, 'image/webp', {
        originalFilename: originalFilename,
        uploadedBy: session.user?.email || 'unknown',
        uploadedAt: new Date().toISOString(),
      })
    } catch (s3Error: unknown) {
      console.error('S3 upload error:', s3Error)
      return res.status(500).json({
        success: false,
        error: {
          message: 'Failed to upload image to S3.',
          code: 'UPLOAD_FAILED',
          details: {
            error:
              s3Error instanceof Error ? s3Error.message : 'Unknown S3 error',
          },
        },
      })
    }

    const uploadedFileInfo: UploadedFileWithId = {
      id: fileId,
      filepath: s3Key,
      originalFilename: originalFilename,
      newFilename: `${fileId}.webp`,
      mimetype: 'image/webp',
      size: webpBuffer.length,
    }

    console.log('File uploaded to S3 successfully:', uploadedFileInfo)

    return res.status(200).json({
      success: true,
      data: {
        id: uploadedFileInfo.id,
        imageUrl,
        filename: originalFilename,
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

    if (tempFilePath) {
      await fs.unlink(tempFilePath).catch(() => {})
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
