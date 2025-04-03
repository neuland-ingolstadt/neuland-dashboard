import { fromRRule, toRRule } from '@/lib/utils/recurrenceUtils'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { Frequency, RRule, rrulestr, type Weekday } from 'rrule'

export const WEEKDAYS = [
  {
    value: RRule.SU,
    label: 'Sonntag',
    shortLabel: 'So',
  },
  { value: RRule.MO, label: 'Montag', shortLabel: 'Mo' },
  { value: RRule.TU, label: 'Dienstag', shortLabel: 'Di' },
  { value: RRule.WE, label: 'Mittwoch', shortLabel: 'Mi' },
  { value: RRule.TH, label: 'Donnerstag', shortLabel: 'Do' },
  { value: RRule.FR, label: 'Freitag', shortLabel: 'Fr' },
  { value: RRule.SA, label: 'Samstag', shortLabel: 'Sa' },
] as const

export type EndType =
  | {
      endType: 'after'
      count: number
    }
  | {
      endType: 'on-date'
      until: Date
    }
  | {
      endType: 'never'
    }

export type FrequencyType =
  | {
      frequency: Frequency.DAILY
      interval: 1
      weekdays: Weekday[]
    }
  | {
      frequency: Frequency.WEEKLY
      weekdays: Weekday[]
    }
  | {
      frequency: Frequency.MONTHLY
      recurrenceType: 'absolute' | 'relative' | 'last'
    }
  | {
      frequency: Frequency.YEARLY
      recurrenceType: 'absolute' | 'relative' | 'last'
    }

export type RecurrenceType = {
  isRecurring: boolean
  interval: number
} & FrequencyType &
  EndType

export const INITIAL_RECURRENCE_VALUES: RecurrenceType = {
  isRecurring: false,
  frequency: Frequency.WEEKLY,
  interval: 1,
  weekdays: [],
  endType: 'never',
}

type RecurrencesProviderProps = {
  children: React.ReactNode
  openRecurrenceDialog?: (bool: boolean) => void
  startDate: Date
  onStartDateChange: (date: Date) => void
  existingRrule?: string | null
}

type RecurrencesProviderState = {
  recurrence: RecurrenceType
  changeRecurrence: (values: Partial<RecurrenceType>) => void
  startDate: Date | undefined
  onStartDateChange: (date: Date | undefined) => void
  rrule: RRule | null
}

const initialState: RecurrencesProviderState = {
  recurrence: INITIAL_RECURRENCE_VALUES,
  changeRecurrence: () => {},
  startDate: undefined,
  onStartDateChange: () => {},
  rrule: null,
}

const RecurrencesProviderContext =
  createContext<RecurrencesProviderState>(initialState)

export function RecurrencesProvider({
  children,
  startDate,
  onStartDateChange,
  existingRrule,
  ...props
}: RecurrencesProviderProps) {
  // direct approach does not work with form watch and setValue
  const [startDateValue, setStartDateValue] = useState<Date | undefined>(
    startDate
  )

  useEffect(() => {
    setStartDateValue(startDate)
  }, [startDate])

  const handleStartDateChange = useCallback(
    (date: Date | undefined) => {
      setStartDateValue(date)
      onStartDateChange(date || new Date())
    },
    [onStartDateChange]
  )

  const [recurrence, setRecurrence] = useState<RecurrenceType>(
    () => INITIAL_RECURRENCE_VALUES
  )

  useEffect(() => {
    if (existingRrule) {
      const rrule = rrulestr(existingRrule)
      const recurrence = fromRRule(rrule)
      setRecurrence(recurrence)
    }
  }, [existingRrule])

  const changeRecurrence = useCallback((values: Partial<RecurrenceType>) => {
    setRecurrence((prev) => {
      return {
        ...prev,
        ...values,
      } as RecurrenceType
    })
  }, [])

  const rrule = useMemo(() => {
    if (!recurrence || !startDateValue) return null

    return toRRule(recurrence, startDateValue)
  }, [recurrence, startDateValue])

  const value = {
    recurrence,
    changeRecurrence,
    startDate: startDateValue,
    onStartDateChange: handleStartDateChange,
    rrule,
  }

  return (
    <RecurrencesProviderContext.Provider value={value} {...props}>
      {children}
    </RecurrencesProviderContext.Provider>
  )
}

export const useRecurrence = () => {
  const context = useContext(RecurrencesProviderContext)

  if (context === undefined)
    throw new Error('useRecurrences must be used within a RecurrencesProvider')

  return context
}
