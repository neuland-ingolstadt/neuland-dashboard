import { SportsEvent } from '@/lib/backend/sportEvents'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type Weekday = SportsEvent['weekday']

export const weekdays: Record<
  Weekday,
  { de: string; en: string; order: number }
> = {
  Monday: { de: 'Montag', en: 'Monday', order: 1 },
  Tuesday: { de: 'Dienstag', en: 'Tuesday', order: 2 },
  Wednesday: { de: 'Mittwoch', en: 'Wednesday', order: 3 },
  Thursday: { de: 'Donnerstag', en: 'Thursday', order: 4 },
  Friday: { de: 'Freitag', en: 'Friday', order: 5 },
  Saturday: { de: 'Samstag', en: 'Saturday', order: 6 },
  Sunday: { de: 'Sonntag', en: 'Sunday', order: 7 },
} as const
