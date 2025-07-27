import fs from 'node:fs/promises'
import path from 'node:path'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { groups } from '@/lib/backend/groups'
import type { ApiResponse } from '@/types/api'
import type { Session } from 'next-auth'
import { getServerSession } from 'next-auth'
import { type NextRequest, NextResponse } from 'next/server'

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

async function isAuthorized(session: Session | null) {
  return (
    session &&
    (session.user.groups.includes(groups.announcements) ||
      session.user.groups.includes(groups.admin))
  )
}

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!(await isAuthorized(session))) {
    return NextResponse.json(
      {
        success: false,
        error: { message: 'Not authorized!', code: 'UNAUTHORIZED' },
      } as ImageListApiResponse,
      { status: 403 }
    )
  }
  if (!session) {
    return NextResponse.json(
      {
        success: false,
        error: { message: 'Not authenticated!', code: 'UNAUTHORIZED' },
      } as ImageListApiResponse,
      { status: 401 }
    )
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
    return NextResponse.json({
      success: true,
      data: images,
    } as ImageListApiResponse)
  } catch (error: unknown) {
    console.error('Error listing images:', error)
    if (
      error instanceof Error &&
      (error as NodeJS.ErrnoException).code === 'ENOENT'
    ) {
      return NextResponse.json({
        success: true,
        data: [],
      } as ImageListApiResponse)
    }
    return NextResponse.json(
      {
        success: false,
        error: { message: 'Failed to list images.', code: 'SERVER_ERROR' },
      } as ImageListApiResponse,
      { status: 500 }
    )
  }
}
