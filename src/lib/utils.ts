import { SportsEvent } from '@/lib/backend/sportEvents'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type Weekday = SportsEvent['weekday']

export const weekdays: Record<Weekday, { de: string; en: string }> = {
  Monday: { de: 'Montag', en: 'Monday' },
  Tuesday: { de: 'Dienstag', en: 'Tuesday' },
  Wednesday: { de: 'Mittwoch', en: 'Wednesday' },
  Thursday: { de: 'Donnerstag', en: 'Thursday' },
  Friday: { de: 'Freitag', en: 'Friday' },
  Saturday: { de: 'Samstag', en: 'Saturday' },
  Sunday: { de: 'Sonntag', en: 'Sunday' },
} as const
