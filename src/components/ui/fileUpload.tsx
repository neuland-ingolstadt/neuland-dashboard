'use client'

import type React from 'react'
import { useState, useCallback } from 'react'
import {
  useDropzone,
  type FileRejection,
  type DropzoneState,
} from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type {
  ApiResponse,
  UploadSuccessResponse,
  FileUploadErrorCode,
} from '@/types/api'

interface FileUploadProps {
  uploadUrl: string
  allowedFileTypes?: string[]
  maxFileSizeMB?: number
  onUploadSuccess?: (data: UploadSuccessResponse) => void
  onUploadError?: (error: {
    message: string
    code?: FileUploadErrorCode
    details?: Record<string, unknown>
  }) => void
  className?: string
  children?: React.ReactNode
  multiple?: boolean
}

const DEFAULT_ALLOWED_FILE_TYPES: string[] = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
]
const DEFAULT_MAX_FILE_SIZE_MB = 5

export const FileUpload: React.FC<FileUploadProps> = ({
  allowedFileTypes = DEFAULT_ALLOWED_FILE_TYPES,
  maxFileSizeMB = DEFAULT_MAX_FILE_SIZE_MB,
  onUploadSuccess,
  onUploadError,
  className,
  children,
  multiple = false,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [isUploading, setIsUploading] = useState<boolean>(false)

  const maxFileSizeBytes: number = maxFileSizeMB * 1024 * 1024

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]): void => {
      if (fileRejections.length > 0) {
        for (const { errors } of fileRejections) {
          for (const err of errors) {
            if (err.code === 'file-too-large') {
              toast.error('File Too Large')
            } else if (err.code === 'file-invalid-type') {
              toast.error('Invalid File Type')
            } else {
              toast.error('File Upload Error')
            }
          }
        }
        setSelectedFile(null)
        setUploadProgress(0)
        return
      }

      if (acceptedFiles.length > 0) {
        const fileToUpload: File = multiple
          ? acceptedFiles[0]
          : acceptedFiles[0]
        setSelectedFile(fileToUpload)
        setUploadProgress(0)
      }
    },
    [multiple]
  )

  const { getRootProps, getInputProps, isDragActive, open }: DropzoneState =
    useDropzone({
      onDrop,
      multiple,
      maxSize: maxFileSizeBytes,
      accept: allowedFileTypes.reduce(
        (acc: Record<string, string[]>, type: string) => {
          acc[type] = []
          return acc
        },
        {}
      ),
      noClick: true,
      noKeyboard: true,
    })

  const handleUpload = async (): Promise<void> => {
    if (!selectedFile) {
      toast.error('Please select a file to upload.')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    const formData = new FormData()
    formData.append('image', selectedFile)

    try {
      const xhr = new XMLHttpRequest()

      xhr.upload.onprogress = (event: ProgressEvent): void => {
        if (event.lengthComputable) {
          const percent: number = Math.round((event.loaded / event.total) * 100)
          setUploadProgress(percent)
        }
      }

      xhr.onreadystatechange = (): void => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          setIsUploading(false)
          try {
            const result: ApiResponse<UploadSuccessResponse | null> =
              JSON.parse(xhr.responseText)

            if (xhr.status >= 200 && xhr.status < 300 && result.success) {
              toast.success('File uploaded successfully!')

              if (result.data) {
                onUploadSuccess?.(result.data)
              }
              setSelectedFile(null)
              setUploadProgress(0)
            } else {
              const errorResponse: {
                message: string
                code?: FileUploadErrorCode
                details?: Record<string, unknown>
              } = !result.success
                ? result.error
                : { message: 'Unknown error occurred.' }

              toast.error(errorResponse.message || 'Upload failed.', {
                description: errorResponse.details
                  ? JSON.stringify(errorResponse.details)
                  : undefined,
                action: (
                  <Button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="mt-2"
                  >
                    Try Again
                  </Button>
                ),
              })
              onUploadError?.(errorResponse)
            }
          } catch (parseError: unknown) {
            console.error(
              'JSON parse error or unexpected response:',
              parseError,
              xhr.responseText
            )
            toast.error('Failed to parse server response.', {
              description: 'An unexpected error occurred on the server.',
            })
            onUploadError?.({
              message: 'Failed to parse server response.',
              code: 'SERVER_ERROR',
            })
          }
        }
      }

      xhr.open('POST', '/api/uploadImage', true)
      xhr.send(formData)
    } catch (error: unknown) {
      setIsUploading(false)
      console.error('Upload error:', error)
      let errorMessage = 'An unexpected error occurred during upload.'
      if (error instanceof Error) {
        errorMessage = error.message
      }
      toast.error('Upload Error', {
        description: errorMessage,
      })
      onUploadError?.({
        message: errorMessage,
        code: 'UPLOAD_FAILED',
      })
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      <Label htmlFor="file-upload">Upload File</Label>
      <div
        {...getRootProps()}
        className={cn(
          'flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-md cursor-pointer text-center',
          'transition-colors duration-200 ease-in-out',
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400',
          selectedFile ? 'border-green-500' : ''
        )}
      >
        <Input {...getInputProps()} id="file-upload" className="hidden" />
        {children || (
          <>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isDragActive
                ? 'Drop the files here...'
                : 'Drag & drop files here, or click to select'}
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-4"
              onClick={open}
              disabled={isUploading}
            >
              Select File
            </Button>
          </>
        )}
        {selectedFile && (
          <div className="mt-4 text-sm text-gray-700 dark:text-gray-300">
            Selected: {selectedFile.name} (
            {Math.round(selectedFile.size / 1024)} KB)
          </div>
        )}
      </div>

      {isUploading && selectedFile && (
        <div className="space-y-2">
          <Progress value={uploadProgress} className="w-full" />
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Uploading {selectedFile.name}... ({uploadProgress}%)
          </p>
        </div>
      )}

      <Button
        onClick={handleUpload}
        disabled={!selectedFile || isUploading}
        className="w-full"
      >
        {isUploading ? 'Uploading...' : 'Confirm Upload'}
      </Button>
    </div>
  )
}
