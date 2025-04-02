import { createContext, useCallback, useContext, useState } from 'react'
import { Frequency, RRule, type Weekday } from 'rrule'

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

type EndType =
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

type FrequencyType =
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
      reoccurrenceType: 'absolute' | 'relative'
    }
  | {
      frequency: Frequency.YEARLY
      reoccurrenceType: 'absolute' | 'relative'
    }

export type RecurrenceType = {
  isRecurring: boolean
  interval: number
} & FrequencyType &
  EndType

export const INITIAL_RECURRENCE_VALUES: RecurrenceType = {
  isRecurring: false,
  frequency: Frequency.DAILY,
  interval: 1,
  weekdays: [],
  endType: 'never',
}

type RecurrencesProviderProps = {
  children: React.ReactNode
  openRecurrenceDialog?: (bool: boolean) => void
}

type RecurrencesProviderState = {
  recurrence: RecurrenceType
  changeRecurrence: (values: Partial<RecurrenceType>) => void
}

const initialState: RecurrencesProviderState = {
  recurrence: INITIAL_RECURRENCE_VALUES,
  changeRecurrence: () => {},
}

const RecurrencesProviderContext =
  createContext<RecurrencesProviderState>(initialState)

export function RecurrencesProvider({
  children,
  ...props
}: RecurrencesProviderProps) {
  const [recurrence, setRecurrence] = useState<RecurrenceType>(
    () => INITIAL_RECURRENCE_VALUES
  )

  const changeRecurrence = useCallback((values: Partial<RecurrenceType>) => {
    setRecurrence((prev) => {
      console.log('prev', prev)
      return {
        ...prev,
        ...values,
      } as RecurrenceType
    })
  }, [])

  const value = {
    recurrence,
    changeRecurrence,
  }

  return (
    <RecurrencesProviderContext.Provider value={value} {...props}>
      {children}
    </RecurrencesProviderContext.Provider>
  )
}

export const useRecurrences = () => {
  const context = useContext(RecurrencesProviderContext)

  if (context === undefined)
    throw new Error('useRecurrences must be used within a RecurrencesProvider')

  return context
}
