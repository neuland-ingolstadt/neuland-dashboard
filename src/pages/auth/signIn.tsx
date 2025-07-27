import { Button } from '@/components/ui/button'
import Logo from '@public/logo.webp'
import { signIn } from 'next-auth/react'
import Head from 'next/head'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { useMemo } from 'react'

export default function SignInPage() {
  const searchParams = useSearchParams()
  const callbackUrl = useMemo(() => {
    const value = searchParams.get('callbackUrl')
    return value ?? '/'
  }, [searchParams])
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
      <Head>
        <title>Neuland e.V. - Anmelden</title>
      </Head>

      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md dark:bg-gray-800 dark:shadow-lg">
        <Image
          src={Logo}
          alt="Neuland e.V. Logo"
          priority
          width={200}
          height={200}
          className="mx-auto"
        />
        <h1 className="text-center text-4xl font-bold text-gray-900 dark:text-white">
          Willkommen zurück!
        </h1>
        <p className="mt-2 text-center text-gray-600 dark:text-gray-300">
          Melde dich mit deinem Neuland Account an.
        </p>

        <Button
          onClick={() => signIn('authentik', { callbackUrl })}
          className="mt-6 w-full"
        >
          Mit SSO fortfahren
        </Button>
      </div>
    </div>
  )
}
