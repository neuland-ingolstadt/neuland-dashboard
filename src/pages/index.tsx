import { Button } from '@/components/ui/button'
import NavBar from '@/components/ui/nav-bar'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useMemo } from 'react'

export default function Home() {
  const { query } = useRouter()
  const callbackUrl = useMemo(() => {
    if (typeof query.callbackUrl === 'string') {
      return query.callbackUrl
    }
    return '/dashboard'
  }, [query.callbackUrl])

  console.log(query)

  return (
    <div>
      <NavBar />

      <Button onClick={() => signIn('authentik', { callbackUrl })}>
        Sign In
      </Button>
    </div>
  )
}
