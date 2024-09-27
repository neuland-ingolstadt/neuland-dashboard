import { X } from 'lucide-react'

export default function AuthErrorPage() {
  // TODO: TEMPORARY PAGE

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <X className="text-error-foreground h-16 w-16" />
      <h1 className="mt-4 text-4xl font-bold">Fehler beim Authentifizieren</h1>
      <p className="mt-2 text-muted-foreground">
        Es ist ein Fehler beim Authentifizieren aufgetreten.
      </p>
    </div>
  )
}
