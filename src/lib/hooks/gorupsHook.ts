import { Group, groups } from '@/lib/backend/groups'
import { useSession } from 'next-auth/react'
import { useMemo } from 'react'

export function useUserGroups() {
  const { data } = useSession()

  const userGroups = useMemo(() => {
    const values = data?.user?.groups
    // return every key of groups that is in values
    return Object.entries(groups)
      .filter(([, value]) => values?.includes(value))
      .map(([key]) => key) as Group[]
  }, [data])

  return {
    userGroups,
  }
}
