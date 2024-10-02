import { Announcement } from '@/lib/backend/announcements'
import { useCallback } from 'react'

export const announcementStatus = {
  active: 'Aktiv',
  upcoming: 'Anstehend',
  past: 'Abgelaufen',
} as const

type AnnouncementStatus = keyof typeof announcementStatus

export function useAnnouncementsUtils() {
  const getStatus = useCallback(
    (announcement: Announcement): AnnouncementStatus => {
      const now = new Date()

      if (now < announcement.startDateTime) {
        return 'upcoming'
      } else if (now > announcement.endDateTime) {
        return 'past'
      } else {
        return 'active'
      }
    },
    []
  )

  const getStatusClasses = useCallback((status: AnnouncementStatus) => {
    switch (status) {
      case 'active':
        return 'bg-green-500'
      case 'upcoming':
        return 'bg-orange-500'
      case 'past':
        return 'bg-red-500'
    }
  }, [])

  return { getStatus, getStatusClasses }
}
