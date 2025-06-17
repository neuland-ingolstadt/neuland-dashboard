export type ApiResponse<T> =
  | {
      success: true
      data: T
    }
  | {
      success: false
      error: {
        message: string
        code?: FileUploadErrorCode
        details?: Record<string, unknown>
      }
    }

export type UploadSuccessResponse = {
  imageUrl: string
  filename: string
  size: number
}

export type FileUploadErrorCode =
  | 'FILE_TOO_LARGE'
  | 'INVALID_FILE_TYPE'
  | 'NO_FILE_UPLOADED'
  | 'UPLOAD_FAILED'
  | 'UNAUTHORIZED'
  | 'METHOD_NOT_ALLOWED'
  | 'SERVER_ERROR'

export interface UploadedFile {
  filepath: string
  originalFilename: string | null
  newFilename: string
  mimetype: string | null
  size: number
}
