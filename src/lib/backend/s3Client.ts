import {
  DeleteObjectCommand,
  type DeleteObjectCommandInput,
  ListObjectsV2Command,
  type ListObjectsV2CommandInput,
  PutObjectCommand,
  type PutObjectCommandInput,
  S3Client,
  type _Object,
} from '@aws-sdk/client-s3'

const S3_REGION = process.env.S3_REGION || 'nbg1'
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME
const S3_ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID
const S3_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY
const S3_ENDPOINT =
  process.env.S3_ENDPOINT || 'https://nbg1.your-objectstorage.com'

if (!S3_BUCKET_NAME || !S3_ACCESS_KEY_ID || !S3_SECRET_ACCESS_KEY) {
  throw new Error(
    'Missing required S3 environment variables: S3_BUCKET_NAME, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY'
  )
}

export const s3Client = new S3Client({
  region: S3_REGION,
  endpoint: S3_ENDPOINT,
  credentials: {
    accessKeyId: S3_ACCESS_KEY_ID,
    secretAccessKey: S3_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
})

export { S3_BUCKET_NAME, S3_REGION, S3_ENDPOINT }

export async function uploadToS3(
  key: string,
  buffer: Buffer,
  contentType: string,
  metadata?: Record<string, string>
): Promise<string> {
  const uploadParams: PutObjectCommandInput = {
    Bucket: S3_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    // Make the object publicly readable
    ACL: 'public-read',
    Metadata: metadata,
  }

  try {
    const command = new PutObjectCommand(uploadParams)
    await s3Client.send(command)

    return `${S3_ENDPOINT}/${S3_BUCKET_NAME}/${key}`
  } catch (error) {
    console.error('Error uploading to S3:', error)
    throw new Error(
      `Failed to upload file to S3: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

export async function listS3Objects(
  prefix?: string,
  maxKeys = 1000
): Promise<_Object[]> {
  const listParams: ListObjectsV2CommandInput = {
    Bucket: S3_BUCKET_NAME,
    Prefix: prefix,
    MaxKeys: maxKeys,
  }

  try {
    const command = new ListObjectsV2Command(listParams)
    const response = await s3Client.send(command)
    return response.Contents || []
  } catch (error) {
    console.error('Error listing S3 objects:', error)
    throw new Error(
      `Failed to list S3 objects: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

export async function deleteFromS3(key: string): Promise<void> {
  const deleteParams: DeleteObjectCommandInput = {
    Bucket: S3_BUCKET_NAME,
    Key: key,
  }

  try {
    const command = new DeleteObjectCommand(deleteParams)
    await s3Client.send(command)
  } catch (error) {
    console.error('Error deleting from S3:', error)
    throw new Error(
      `Failed to delete file from S3: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

export function generateS3Key(fileId: string): string {
  return `uploads/announcements/${fileId}.webp`
}

export function extractFilenameFromKey(key: string): string {
  return key.split('/').pop() || key
}

export function getS3PublicUrl(key: string): string {
  return `${S3_ENDPOINT}/${S3_BUCKET_NAME}/${key}`
}
