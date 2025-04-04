import { Toggle } from '@/components/ui/toggle'
import { WEEKDAYS, useRecurrence } from '@/lib/providers/recurrenceProvider'
import React, { useCallback, useEffect } from 'react'
import { Frequency, type Weekday } from 'rrule'

const WeekdaySelector = React.memo(function WeekdaySelector() {
  const { recurrence, changeRecurrence, startDate } = useRecurrence()

  if (!recurrence) return null

  if (
    !(
      recurrence.frequency === Frequency.WEEKLY ||
      recurrence.frequency === Frequency.DAILY
    )
  ) {
    return null
  }

  useEffect(() => {
    if (recurrence.weekdays.length < 1) {
      const weekday = startDate?.getDay() || 0
      const newWeekdays = WEEKDAYS.filter(
        (w) => w.value.getJsWeekday() === weekday
      ).map((w) => w.value)

      changeRecurrence({ weekdays: newWeekdays })
    }
  }, [recurrence.weekdays, changeRecurrence, startDate])

  const isPressed = useCallback(
    (weekday: Weekday) => {
      return recurrence.weekdays.map((w) => w.weekday).includes(weekday.weekday)
    },
    [recurrence.weekdays]
  )

  const handleChange = useCallback(
    (pressed: boolean, weekday: Weekday) => {
      if (!pressed && recurrence.weekdays.length === 1) {
        return
      }

      const newWeekdays = !pressed
        ? recurrence.weekdays.filter((w) => w.weekday !== weekday.weekday)
        : [...recurrence.weekdays, weekday]
      changeRecurrence({ weekdays: newWeekdays })
    },
    [recurrence.weekdays, changeRecurrence]
  )

  return (
    <div className="grid grid-cols-7 gap-3">
      {WEEKDAYS.map((day) => (
        <Toggle
          key={day.value.weekday}
          variant="outline"
          className="!aspect-square h-full"
          pressed={isPressed(day.value)}
          onPressedChange={(pressed) => handleChange(pressed, day.value)}
        >
          {day.shortLabel}
        </Toggle>
      ))}
    </div>
  )
})

export default WeekdaySelector
