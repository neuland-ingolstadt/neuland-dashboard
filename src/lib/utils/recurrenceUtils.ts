// @ts-nocheck this the types make no sense at all, please dont touch this file
import { ALL_WEEKDAYS, Frequency, type Options, RRule, Weekday } from 'rrule'
import type { EndType, RecurrenceType } from '../providers/recurrenceProvider'

/**
 * Converts a RecurrenceType object to an RRule instance
 * @param recurrence The recurrence configuration
 * @param startDate The start date for the recurrence rule
 * @returns An RRule instance representing the recurrence pattern
 */
export function toRRule(
  recurrence: RecurrenceType,
  startDate: Date
): RRule | null {
  if (!recurrence.isRecurring) {
    return null
  }

  const options: Partial<Options> = {
    freq: recurrence.frequency,
    interval: recurrence.interval,
    dtstart: startDate,
  }

  console.log('Recurrence:', recurrence)

  // Handle end type
  if (recurrence.endType === 'after') {
    options.count = recurrence.count
  } else if (recurrence.endType === 'on-date') {
    options.until = recurrence.until
  }

  // Handle frequency-specific options
  switch (recurrence.frequency) {
    case Frequency.DAILY:
      // For daily frequency, byweekday is only used if specific weekdays are selected
      if (!recurrence.weekdays) {
        recurrence.weekdays = []
      }

      if (recurrence.weekdays.length > 0 && recurrence.interval === 1) {
        options.byweekday = recurrence.weekdays
      }
      break

    case Frequency.WEEKLY:
      if (!recurrence.weekdays) {
        recurrence.weekdays = []
      }

      // For weekly frequency, we need to set the byweekday option
      if (recurrence.weekdays.length > 0) {
        options.byweekday = recurrence.weekdays
      }
      break

    case Frequency.MONTHLY:
      // Handle monthly recurrence type
      if (recurrence.recurrenceType === 'absolute') {
        // Use the day of month from the start date
        options.bymonthday = startDate.getDate()
      } else if (recurrence.recurrenceType === 'relative') {
        // Use the nth weekday of month
        const weekday = startDate.getDay()
        const nthWeekday = Math.floor((startDate.getDate() - 1) / 7)

        if (nthWeekday < 4) {
          options.byweekday = [
            Weekday.fromStr(ALL_WEEKDAYS[weekday]).nth(nthWeekday + 1),
          ]
        } else {
          options.byweekday = [Weekday.fromStr(ALL_WEEKDAYS[weekday]).nth(-1)]
        }
      } else if (recurrence.recurrenceType === 'last') {
        // Use the last weekday of month
        const weekday = startDate.getDay()
        options.byweekday = [Weekday.fromStr(ALL_WEEKDAYS[weekday]).nth(-1)]
      }
      break

    case Frequency.YEARLY:
      // For yearly recurrence, set the month
      options.bymonth = startDate.getMonth() + 1 // JavaScript months are 0-indexed

      // Handle yearly recurrence type
      if (recurrence.recurrenceType === 'absolute') {
        // Use the day of month from the start date
        options.bymonthday = startDate.getDate()
      } else if (recurrence.recurrenceType === 'relative') {
        // Use the nth weekday of month
        const weekday = startDate.getDay()
        const nthWeekday = Math.floor((startDate.getDate() - 1) / 7)
        options.byweekday = [
          Weekday.fromStr(ALL_WEEKDAYS[weekday]).nth(nthWeekday + 1),
        ]
      } else if (recurrence.recurrenceType === 'last') {
        // Use the last weekday of month
        const weekday = startDate.getDay()
        options.byweekday = [Weekday.fromStr(ALL_WEEKDAYS[weekday]).nth(-1)]
      }
      break
  }

  return new RRule(options)
}

/**
 * Converts an RRule instance to a RecurrenceType object
 * @param rule The RRule instance to convert
 * @returns A RecurrenceType object representing the recurrence pattern
 */
export function fromRRule(rule: RRule): RecurrenceType {
  const options = rule.options
  const frequency = options.freq
  const interval = options.interval || 1

  // Determine end type
  let endType: EndType
  if (options.count) {
    endType = {
      endType: 'after',
      count: options.count,
    }
  } else if (options.until) {
    endType = {
      endType: 'on-date',
      until: options.until,
    }
  } else {
    endType = {
      endType: 'never',
    }
  }

  // Base recurrence properties
  const baseRecurrence = {
    isRecurring: true,
    interval,
    ...endType,
  }

  // Add frequency-specific properties
  switch (frequency) {
    case Frequency.DAILY: {
      const weekdays = options.byweekday || []
      return {
        ...baseRecurrence,
        frequency: Frequency.DAILY,
        interval: 1,
        weekdays: Array.isArray(weekdays) ? weekdays : [weekdays],
      }
    }

    case Frequency.WEEKLY: {
      const weekdays = options.byweekday || []
      return {
        ...baseRecurrence,
        frequency: Frequency.WEEKLY,
        weekdays: Array.isArray(weekdays) ? weekdays : [weekdays],
      }
    }

    case Frequency.MONTHLY: {
      // Determine recurrence type
      let recurrenceType: 'absolute' | 'relative' | 'last' = 'absolute'

      // If byweekday exists and has nth value
      if (options.byweekday) {
        const weekday = Array.isArray(options.byweekday)
          ? options.byweekday[0]
          : options.byweekday

        if (typeof weekday === 'object' && 'n' in weekday) {
          recurrenceType = weekday.n < 0 ? 'last' : 'relative'
        }
      }

      return {
        ...baseRecurrence,
        frequency: Frequency.MONTHLY,
        recurrenceType,
      } as RecurrenceType
    }

    case Frequency.YEARLY: {
      // Determine recurrence type
      let recurrenceType: 'absolute' | 'relative' | 'last' = 'absolute'

      // If byweekday exists and has nth value
      if (options.byweekday) {
        const weekday = Array.isArray(options.byweekday)
          ? options.byweekday[0]
          : options.byweekday

        if (typeof weekday === 'object' && 'n' in weekday) {
          recurrenceType = weekday.n < 0 ? 'last' : 'relative'
        }
      }

      return {
        ...baseRecurrence,
        frequency: Frequency.YEARLY,
        recurrenceType,
      } as RecurrenceType
    }

    default:
      // Default to weekly if unknown frequency
      return {
        ...baseRecurrence,
        frequency: Frequency.WEEKLY,
        weekdays: [],
      } as RecurrenceType
  }
}
