import ErrorDialog from '@/components/ui/dialog/errorDialog'
import LoadingDialog from '@/components/ui/dialog/loadingDialog'
import { createContext, useCallback, useContext, useState } from 'react'

type DialogsProviderProps = {
  children: React.ReactNode
}

type DialogsProviderState = {
  setLoading: (loading: boolean) => void
  setLoadingMessage: (message: string | undefined) => void

  openErrorDialog: (message: string) => void
}

const initialState: DialogsProviderState = {
  setLoading: () => {},
  setLoadingMessage: () => {},
  openErrorDialog: () => {},
}

const DialogsProviderContext = createContext<DialogsProviderState>(initialState)

export function DialogsProvider({ children, ...props }: DialogsProviderProps) {
  const [loading, setLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState<string | undefined>(
    undefined
  )

  const [errorOpen, setErrorOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const openErrorDialog = useCallback((message: string) => {
    setErrorMessage(message)
    setErrorOpen(true)
  }, [])

  const value = {
    setLoading,
    setLoadingMessage,
    openErrorDialog,
  }

  return (
    <DialogsProviderContext.Provider
      value={value}
      {...props}
    >
      <LoadingDialog
        open={loading}
        setOpen={setLoading}
        message={loadingMessage}
      />

      <ErrorDialog
        open={errorOpen}
        setOpen={setErrorOpen}
        message={errorMessage}
      />
      {children}
    </DialogsProviderContext.Provider>
  )
}

export const useDialogs = () => {
  const context = useContext(DialogsProviderContext)

  if (context === undefined)
    throw new Error('useDialogs must be used within a DialogsProvider')

  return context
}
