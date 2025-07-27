'use client'
import { Button } from '@/components/ui/button'
import { CircleX } from 'lucide-react'
import Head from 'next/head'
import Link from 'next/link'

export default function AuthErrorPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <Head>
        <title>Authentifizierung fehlgeschlagen</title>
      </Head>

      <CircleX className="text-error-foreground h-16 w-16" />
      <h1 className="mt-4 text-4xl font-bold">
        Authentifizierung fehlgeschlagen
      </h1>
      <p className="mt-2 text-muted-foreground">
        Es ist ein Fehler bei der Authentifizierung aufgetreten.
      </p>

      <Link href="https://sso.informatik.sexy/flows/-/cancel/" passHref>
        <Button className="mt-6">Falscher Account?</Button>
      </Link>
    </div>
  )
}
