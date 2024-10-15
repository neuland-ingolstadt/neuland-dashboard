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

export const sportsCategories = [
  { value: 'Badminton', label: 'Badminton' },
  { value: 'Baseball', label: 'Baseball' },
  { value: 'Basketball', label: 'Basketball' },
  { value: 'Boxing', label: 'Boxen' },
  { value: 'Calisthenics', label: 'Calisthenics' },
  { value: 'MartialArts', label: 'Kampfsport' },
  { value: 'Running', label: 'Laufen' },
  { value: 'Dancing', label: 'Tanzen' },
  { value: 'Defense', label: 'Defense' },
  { value: 'Frisbee', label: 'Frisbee' },
  { value: 'FullBodyWorkout', label: 'Ganzkörpertraining' },
  { value: 'Handball', label: 'Handball' },
  { value: 'Hockey', label: 'Hockey' },
  { value: 'Jogging', label: 'Joggen' },
  { value: 'Kickboxing', label: 'Kickboxen' },
  { value: 'Climbing', label: 'Klettern' },
  { value: 'StrengthTraining', label: 'Krafttraining' },
  { value: 'Meditation', label: 'Meditation' },
  { value: 'Cycling', label: 'Radfahren' },
  { value: 'Parkour', label: 'Parkour' },
  { value: 'Rowing', label: 'Rudern' },
  { value: 'Skateboarding', label: 'Skateboarden' },
  { value: 'Soccer', label: 'Fußball' },
  { value: 'Spikeball', label: 'Spikeball' },
  { value: 'Swimming', label: 'Schwimmen' },
  { value: 'TableTennis', label: 'Tischtennis' },
  { value: 'Tennis', label: 'Tennis' },
  { value: 'Volleyball', label: 'Volleyball' },
  { value: 'Hiking', label: 'Wandern' },
  { value: 'Waterpolo', label: 'Wasserball' },
  { value: 'Yoga', label: 'Yoga' },
  { value: 'Other', label: 'Sonstiges' },
] as const
export const sportsCategoriesKeys = sportsCategories.map(
  (category) => category.value
) as [string, ...string[]]
