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
    <div className="flex h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">Sign In</h1>
      <p className="mt-2 text-muted-foreground">
        This is a temporary sign in page.
      </p>

      <Button onClick={() => signIn('authentik', { callbackUrl })}>
        Sign In
      </Button>
    </div>
  )
}
