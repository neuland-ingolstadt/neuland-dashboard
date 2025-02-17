import { Badge } from '@/components/ui/badge'
import UpdateSession from '@/components/ui/dialog/updateSession'
import { KeyRound } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useEffect, useMemo, useState } from 'react'

export default function SessionExpiration() {
  const { data } = useSession()
  const [seconds, setSeconds] = useState<number | null>(null)
  const [isExpiredOpen, setIsExpiredOpen] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      if (!data) {
        return null
      }

      const remainingTime = data.accessTokenExpires - Date.now()
      const seconds = Math.floor(remainingTime / 1000)

      setSeconds(seconds)
    }, 1000)
    return () => clearInterval(interval)
  }, [data])

  const isExpired = useMemo(() => {
    return seconds !== null && seconds <= 0
  }, [seconds])

  useEffect(() => {
    setIsExpiredOpen(isExpired)
  }, [isExpired])

  const timeLeft = useMemo(() => {
    if (isExpired) {
      return 'Abgelaufen'
    }

    if (seconds === null) {
      return '...'
    }

    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60

    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }, [isExpired, seconds])

  return (
    <>
      <UpdateSession isOpen={isExpiredOpen} onOpenChange={setIsExpiredOpen} />
      <Badge
        className="mr-2 flex items-center gap-2"
        variant={isExpired ? 'destructive' : 'outline'}
      >
        <KeyRound size={12} />
        <span className="font-mono text-right">{timeLeft}</span>
      </Badge>
    </>
  )
}
