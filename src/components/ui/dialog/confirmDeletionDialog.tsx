import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface ConfirmDeleteDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
  title: string
  onConfirm: () => void
}

export default function ConfirmDeleteDialog({
  open,
  setOpen,
  title,
  onConfirm,
}: ConfirmDeleteDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Diese Aktion kann nicht rückgängig gemacht werden.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="grid grid-cols-2">
          <Button
            onClick={() => setOpen(false)}
            variant="outline"
          >
            Abbrechen
          </Button>

          <Button
            onClick={onConfirm}
            variant="destructive"
          >
            Löschen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
