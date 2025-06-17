'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import type {
  ApiResponse,
  FileUploadErrorCode,
  UploadSuccessResponse,
} from '@/types/api'
import { Upload } from 'lucide-react'
import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

interface FileUploadProps {
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
  multiple = false,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [isUploading, setIsUploading] = useState<boolean>(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const maxFileSizeBytes: number = maxFileSizeMB * 1024 * 1024

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (selectedFile && !isUploading) {
      handleUpload()
    }
  }, [selectedFile])

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const files = event.target.files

    if (!files || files.length === 0) {
      setSelectedFile(null)
      setUploadProgress(0)
      return
    }

    const file = files[0]

    if (allowedFileTypes.length > 0 && !allowedFileTypes.includes(file.type)) {
      toast.error('Ungültiger Dateityp', {
        description: `Die Datei ${file.name} ist kein erlaubter Typ.`,
      })
      setSelectedFile(null)
      setUploadProgress(0)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    if (file.size > maxFileSizeBytes) {
      toast.error('Datei zu groß', {
        description: `${file.name} überschreitet das Limit von ${maxFileSizeMB}MB.`,
      })
      setSelectedFile(null)
      setUploadProgress(0)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    setSelectedFile(file)
  }

  const handleUpload = async (): Promise<void> => {
    if (!selectedFile) {
      toast.error('Keine Datei zum Hochladen.', {
        description: 'Bitte wählen Sie zuerst eine Datei aus.',
      })
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
              toast.success('Datei erfolgreich hochgeladen!')

              if (result.data) {
                onUploadSuccess?.(result.data)
              }
              setSelectedFile(null)
              setUploadProgress(0)
              if (fileInputRef.current) {
                fileInputRef.current.value = ''
              }
            } else {
              const errorResponse: {
                message: string
                code?: FileUploadErrorCode
                details?: Record<string, unknown>
              } = !result.success
                ? result.error
                : {
                    message:
                      'Unbekannter Fehler aufgetreten oder fehlerhafte Antwort.',
                  }

              toast.error(
                errorResponse.message || 'Hochladen fehlgeschlagen.',
                {
                  description: errorResponse.details
                    ? JSON.stringify(errorResponse.details)
                    : undefined,
                  action: (
                    <Button
                      onClick={triggerFileInput}
                      disabled={isUploading}
                      className="mt-2"
                    >
                      Neue Datei auswählen
                    </Button>
                  ),
                }
              )
              onUploadError?.(errorResponse)
              setSelectedFile(null)
              setUploadProgress(0)
              if (fileInputRef.current) {
                fileInputRef.current.value = ''
              }
            }
          } catch (parseError: unknown) {
            console.error(
              'JSON parse error or unexpected response:',
              parseError,
              xhr.responseText
            )
            toast.error('Fehler beim Parsen der Serverantwort.', {
              description:
                'Ein unerwarteter Fehler ist auf dem Server aufgetreten.',
            })
            onUploadError?.({
              message: 'Fehler beim Parsen der Serverantwort.',
              code: 'SERVER_ERROR',
            })
            setSelectedFile(null)
            setUploadProgress(0)
            if (fileInputRef.current) {
              fileInputRef.current.value = ''
            }
          }
        }
      }

      xhr.open('POST', '/api/uploadImage', true)
      xhr.send(formData)
    } catch (error: unknown) {
      setIsUploading(false)
      console.error('Upload error:', error)
      let errorMessage =
        'Beim Hochladen ist ein unerwarteter Fehler aufgetreten.'
      if (error instanceof Error) {
        errorMessage = error.message
      }
      toast.error('Fehler beim Hochladen', {
        description: errorMessage,
      })
      onUploadError?.({
        message: errorMessage,
        code: 'UPLOAD_FAILED',
      })
      setSelectedFile(null)
      setUploadProgress(0)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const triggerFileInput = (): void => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-col items-center gap-0">
        <Input
          id="file-upload-input"
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept={allowedFileTypes.join(',')}
          multiple={multiple}
          disabled={isUploading}
        />
        <Button
          type="button"
          variant="outline"
          onClick={triggerFileInput}
          disabled={isUploading}
        >
          <Upload className="size-4 mr-2" />
          {isUploading ? 'Wird ausgewählt...' : 'Bild hochladen'}
        </Button>
      </div>

      {isUploading && selectedFile && (
        <div className="space-y-2">
          <Progress value={uploadProgress} className="w-full" />
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Lädt {selectedFile.name} hoch... ({uploadProgress}%)
          </p>
        </div>
      )}
    </div>
  )
}
