'use client'

import type {
  ImageListSuccessResponse,
  ListedImage,
} from '@/app/api/images/route'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { ApiResponse } from '@/types/api'
import { Check, Image } from 'lucide-react'
import type React from 'react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

interface ImageSelectorProps {
  fetchUrl?: string
  onSelectImage: (image: ListedImage) => void
  currentImage?: ListedImage | null
  triggerClassName?: string
  dialogContentClassName?: string
}

const DEFAULT_FETCH_URL = '/api/images'

export const ImageSelector: React.FC<ImageSelectorProps> = ({
  fetchUrl = DEFAULT_FETCH_URL,
  onSelectImage,
  currentImage = null,
  triggerClassName,
  dialogContentClassName,
}) => {
  const [images, setImages] = useState<ListedImage[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<ListedImage | null>(
    currentImage
  )
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)

  useEffect(() => {
    setSelectedImage(currentImage)
  }, [currentImage])

  const fetchImages = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response: Response = await fetch(fetchUrl)
      const result: ApiResponse<ImageListSuccessResponse | null> =
        await response.json()

      if (result.success && result.data) {
        setImages(result.data)
      } else {
        setError(
          'Bilder konnten nicht geladen werden. Bitte versuchen Sie es erneut.'
        )
        toast.error('Bilder konnten nicht geladen werden.', {
          description: 'Bitte versuchen Sie es erneut.',
        })
      }
    } catch (err: unknown) {
      console.error('Error fetching images:', err)
      setError(
        err instanceof Error
          ? err.message
          : 'Ein unerwarteter Fehler ist aufgetreten.'
      )
      toast.error('Netzwerkfehler', {
        description:
          err instanceof Error
            ? err.message
            : 'Verbindung zum Server konnte nicht hergestellt werden.',
      })
    } finally {
      setLoading(false)
    }
  }, [fetchUrl])

  useEffect(() => {
    if (isDialogOpen) {
      fetchImages()
    }
  }, [isDialogOpen, fetchImages])

  const handleImageClick = (image: ListedImage): void => {
    setSelectedImage(image)
  }

  const handleConfirmSelection = (): void => {
    if (selectedImage) {
      onSelectImage(selectedImage)
      setIsDialogOpen(false)
      toast.success('Bild ausgewählt')
    } else {
      toast.warning('Kein Bild ausgewählt', {
        description: 'Bitte wählen Sie ein Bild aus, bevor Sie bestätigen.',
      })
    }
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={cn(triggerClassName)}>
          <Image className="w-4 h-4 mr-2" />
          Bild auswählen
        </Button>
      </DialogTrigger>
      <DialogContent
        className={cn(
          'sm:max-w-[800px] h-[500px] flex flex-col',
          dialogContentClassName
        )}
      >
        <DialogHeader>
          <DialogTitle>Bild auswählen</DialogTitle>
          <DialogDescription>
            Wählen Sie ein Bild aus Ihren hochgeladenen Dateien.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center h-full">
            Bilder werden geladen...
          </div>
        ) : error ? (
          <div className="flex flex-col justify-center items-center h-full text-red-500">
            <p>Fehler: {error}</p>
            <Button onClick={fetchImages} className="mt-4">
              Erneut versuchen
            </Button>
          </div>
        ) : images.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-full text-gray-500">
            <p>Keine Bilder gefunden.</p>
          </div>
        ) : (
          <ScrollArea className="flex-grow pr-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
              {images.map((image) => (
                <button
                  key={image.url}
                  className={cn(
                    'relative border-2 rounded-md overflow-hidden cursor-pointer',
                    'hover:border-blue-500 transition-colors duration-200',
                    selectedImage?.url === image.url
                      ? 'border-blue-600 ring-2 ring-blue-500'
                      : 'border-gray-200'
                  )}
                  onClick={() => handleImageClick(image)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleImageClick(image)
                    }
                  }}
                  tabIndex={0}
                  type="button"
                  aria-pressed={selectedImage?.url === image.url}
                >
                  <img
                    src={image.url}
                    alt={image.name}
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-2 text-sm text-center truncate">
                    {image.name}
                  </div>
                  {selectedImage?.url === image.url && (
                    <div className="absolute top-1 right-1 bg-blue-500 text-white rounded-full p-1 text-xs">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </ScrollArea>
        )}

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleConfirmSelection} disabled={!selectedImage}>
            Auswahl bestätigen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
