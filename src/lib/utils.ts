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
  'Basketball',
  'Soccer',
  'Calisthenics',
  'Dancing',
  'StrengthTraining',
  'Running',
  'Jogging',
  'Handball',
  'Frisbee',
  'Volleyball',
  'Spikeball',
  'FullBodyWorkout',
  'Defense',
  'Yoga',
  'Meditation',
  'Tennis',
  'Badminton',
  'Swimming',
  'Waterpolo',
  'Cycling',
  'Climbing',
  'Boxing',
  'Kickboxing',
  'MartialArts',
  'TableTennis',
  'Rowing',
  'Baseball',
  'Skateboarding',
  'Parkour',
  'Hiking',
  'Other',
] as const

export const friendlySportsCategories: Record<
  (typeof sportsCategories)[number],
  string
> = {
  Badminton: 'Badminton',
  Baseball: 'Baseball',
  Basketball: 'Basketball',
  Boxing: 'Boxen',
  Calisthenics: 'Calisthenics',
  MartialArts: 'Kampfsport',
  Running: 'Laufen',
  Dancing: 'Tanzen',
  Defense: 'Defense',
  Frisbee: 'Frisbee',
  FullBodyWorkout: 'Ganzkörpertraining',
  Handball: 'Handball',
  Jogging: 'Joggen',
  Kickboxing: 'Kickboxen',
  Climbing: 'Klettern',
  StrengthTraining: 'Krafttraining',
  Meditation: 'Meditation',
  Cycling: 'Radfahren',
  Parkour: 'Parkour',
  Rowing: 'Rudern',
  Skateboarding: 'Skateboarden',
  Soccer: 'Fußball',
  Spikeball: 'Spikeball',
  Swimming: 'Schwimmen',
  TableTennis: 'Tischtennis',
  Tennis: 'Tennis',
  Volleyball: 'Volleyball',
  Hiking: 'Wandern',
  Waterpolo: 'Wasserball',
  Yoga: 'Yoga',
  Other: 'Sonstiges',
} as const
