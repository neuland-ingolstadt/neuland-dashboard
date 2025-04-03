import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useRecurrence } from '@/lib/providers/recurrenceProvider'
import {
  addWeeks,
  differenceInWeeks,
  format,
  isSameMonth,
  startOfMonth,
} from 'date-fns'
import { de } from 'date-fns/locale'
import React, { useCallback, useMemo } from 'react'
import { Frequency } from 'rrule'

const ordinalMap: Record<string, string> = {
  '1': 'ersten',
  '2': 'zweiten',
  '3': 'dritten',
  '4': 'vierten',
  '-1': 'letzten',
}

const RecurrenceSelector = React.memo(function RecurrenceSelector() {
  const { recurrence, changeRecurrence, startDate } = useRecurrence()

  if (
    !(
      recurrence.frequency === Frequency.MONTHLY ||
      recurrence.frequency === Frequency.YEARLY
    )
  ) {
    return null
  }

  const handleChange = useCallback(
    (value: string) => {
      changeRecurrence({
        recurrenceType: value as 'absolute' | 'relative' | 'last',
      })
    },
    [changeRecurrence]
  )

  const getAbsoluteLabel = useCallback(() => {
    if (!startDate) return ''

    switch (recurrence.frequency) {
      case Frequency.MONTHLY: {
        const nthOfMonth = startDate.getDate() || 1
        return `Am ${nthOfMonth}. des Monats`
      }
      case Frequency.YEARLY: {
        const dateLabel = format(startDate, 'dd. MMMM', {
          locale: de,
        })
        return `Am ${dateLabel}`
      }
      default:
        return ''
    }
  }, [recurrence.frequency, startDate])

  const isLastDayOfMonth = useCallback(() => {
    if (!startDate) return false

    return !isSameMonth(addWeeks(startDate, 1), startDate)
  }, [startDate])

  const nthWeekdayOfMonth = useMemo(() => {
    if (!startDate) return 0

    return differenceInWeeks(startDate, startOfMonth(startDate)) + 1
  }, [startDate])

  const getOrdinal = useCallback(() => {
    if (!startDate) return ''

    return `${ordinalMap[`${isLastDayOfMonth() && nthWeekdayOfMonth > 4 ? -1 : nthWeekdayOfMonth}`]}`
  }, [startDate, isLastDayOfMonth, nthWeekdayOfMonth])

  const getRelativeLabel = useCallback(() => {
    if (!startDate) return ''

    const label = format(startDate, 'EEEE', {
      locale: de,
    })

    switch (recurrence.frequency) {
      case Frequency.MONTHLY: {
        return `Am ${getOrdinal()} ${label} des Monats`
      }
      case Frequency.YEARLY: {
        const month = format(startDate, 'MMMM', {
          locale: de,
        })
        return `Am ${getOrdinal()} ${label} im ${month}`
      }
      default:
        return ''
    }
  }, [recurrence.frequency, startDate, getOrdinal])

  const getLastLabel = useCallback(() => {
    if (!startDate) return ''

    switch (recurrence.frequency) {
      case Frequency.MONTHLY: {
        return `Am letzten ${format(startDate, 'EEEE', { locale: de })} des Monats`
      }
      case Frequency.YEARLY: {
        return `Am letzten ${format(startDate, 'EEEE', { locale: de })} im ${format(startDate, 'MMMM', { locale: de })}`
      }
      default:
        return ''
    }
  }, [recurrence.frequency, startDate])

  return (
    <FormItem className="space-y-3">
      <FormLabel>Wiederhole am</FormLabel>
      <FormControl>
        <RadioGroup
          onValueChange={handleChange}
          defaultValue={recurrence.recurrenceType || undefined}
          className="flex flex-col space-y-1"
        >
          <FormItem className="flex items-center space-x-3 space-y-0">
            <FormControl>
              <RadioGroupItem value="absolute" />
            </FormControl>
            <FormLabel className="font-normal">{getAbsoluteLabel()}</FormLabel>
          </FormItem>
          <FormItem className="flex items-center space-x-3 space-y-0">
            <FormControl>
              <RadioGroupItem value="relative" />
            </FormControl>
            <FormLabel className="font-normal">{getRelativeLabel()}</FormLabel>
          </FormItem>
          {isLastDayOfMonth() ||
            (nthWeekdayOfMonth === 4 && (
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="last" />
                </FormControl>
                <FormLabel className="font-normal">{getLastLabel()}</FormLabel>
              </FormItem>
            ))}
        </RadioGroup>
      </FormControl>
      <FormMessage />
    </FormItem>
  )
})

export default RecurrenceSelector
