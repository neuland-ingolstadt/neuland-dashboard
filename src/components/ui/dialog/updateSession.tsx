import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { signIn, signOut } from 'next-auth/react'

interface UpdateSessionProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export default function UpdateSession({
  isOpen,
  onOpenChange,
}: UpdateSessionProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent hideCloseButton>
        <DialogHeader>
          <DialogTitle>Session abgelaufen</DialogTitle>
          <DialogDescription>
            Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="destructive"
            onClick={() => {
              onOpenChange(false)
              signOut()
            }}
          >
            Abmelden
          </Button>

          <Button
            variant="default"
            onClick={() => {
              onOpenChange(false)
              signIn('authentik')
            }}
          >
            Erneut anmelden
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
