import { Button } from '@/components/ui/button'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useMemo } from 'react'

export default function SignInPage() {
  const { query } = useRouter()
  const callbackUrl = useMemo(() => {
    if (typeof query.callbackUrl === 'string') {
      return query.callbackUrl
    }
    return '/'
  }, [query.callbackUrl])

  return (
    <div className="flex h-screen flex-col items-center justify-center ">
      <div className="w-full max-w-md space-y-8 rounded-lg p-8 shadow-md">
        <h1 className="text-center text-4xl font-bold">Welcome back!</h1>
        <p className="mt-2 text-center text-muted-foreground">
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
