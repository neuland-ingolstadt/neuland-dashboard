import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { TriangleAlert } from 'lucide-react'

interface ErrorDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
  message?: string
}

export default function ErrorDialog({
  open,
  setOpen,
  message,
}: ErrorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <div className="flex flex-row items-center gap-3">
          <TriangleAlert size={32} className="text-destructive" />
          <DialogHeader>
            <DialogTitle>Ein Fehler ist aufgetreten</DialogTitle>
            {message && <DialogDescription>{message}</DialogDescription>}
          </DialogHeader>
        </div>

        <DialogFooter>
          <Button onClick={() => setOpen(false)}>Schließen</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
