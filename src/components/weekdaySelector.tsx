import { Toggle } from '@/components/ui/toggle'
import { useRecurrences } from '@/lib/providers/recurrenceProvider'
import React from 'react'
import { ALL_WEEKDAYS, Frequency, Weekday } from 'rrule'

const WeekdaySelector = React.memo(function WeekdaySelector() {
  const { recurrence, changeRecurrence } = useRecurrences()

  if (!recurrence) return null

  if (
    !(
      recurrence.frequency === Frequency.WEEKLY ||
      recurrence.frequency === Frequency.DAILY
    )
  ) {
    return null
  }
  return (
    <div className="grid grid-cols-7 gap-3">
      {ALL_WEEKDAYS.map((day) => {
        const weekday = Weekday.fromStr(day)
        return (
          <Toggle
            key={day}
            variant="outline"
            className="!aspect-square h-full"
            pressed={recurrence.weekdays
              .map((w) => w.weekday)
              .includes(weekday.weekday)}
            onPressedChange={(pressed) => {
              const newWeekdays = !pressed
                ? recurrence.weekdays.filter(
                    (w) => w.weekday !== weekday.weekday
                  )
                : [...recurrence.weekdays, weekday]
              changeRecurrence({ weekdays: newWeekdays })
            }}
          >
            {Weekday.fromStr(day).toString()}
          </Toggle>
        )
      })}
    </div>
  )
})

export default WeekdaySelector
