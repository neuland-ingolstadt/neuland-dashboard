import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { LoaderIcon } from 'lucide-react'

interface LoadingDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
  message?: string
}

export default function LoadingDialog({
  open,
  setOpen,
  message,
}: LoadingDialogProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent hideCloseButton>
        <div className="flex flex-row items-center gap-3">
          <LoaderIcon size={32} className="animate-spin" />
          <DialogHeader>
            <DialogTitle>Bitte warten</DialogTitle>
            {message && <DialogDescription>{message}</DialogDescription>}
          </DialogHeader>
        </div>
      </DialogContent>
    </Dialog>
  )
}
