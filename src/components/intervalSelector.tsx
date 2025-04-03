import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRecurrence } from '@/lib/providers/recurrenceProvider'
import React, { useMemo } from 'react'
import { Frequency } from 'rrule'

interface IntervalSelectorProps {
  frequency: Frequency
}

const IntervalSelector = React.memo(function IntervalSelector({
  frequency,
}: IntervalSelectorProps) {
  const { recurrence, changeRecurrence } = useRecurrence()

  const getFrequencyLabel = useMemo(() => {
    switch (frequency) {
      case Frequency.DAILY:
        if (recurrence.interval > 1) {
          return 'Tage'
        }
        return 'Tag'
      case Frequency.WEEKLY:
        if (recurrence.interval > 1) {
          return 'Wochen'
        }
        return 'Woche'
      case Frequency.MONTHLY:
        if (recurrence.interval > 1) {
          return 'Monate'
        }
        return 'Monat'
      case Frequency.YEARLY:
        if (recurrence.interval > 1) {
          return 'Jahre'
        }
        return 'Jahr'
      default:
        return ''
    }
  }, [frequency, recurrence.interval])

  return (
    <div className="flex flex-row gap-3 items-center">
      <span className="text-sm font-medium">Wiederhole alle</span>
      <Select
        defaultValue="1"
        onValueChange={(value) => {
          changeRecurrence({
            interval: Number.parseInt(value),
          })
        }}
        value={`${recurrence.interval}`}
      >
        <SelectTrigger className="w-16">
          <SelectValue placeholder="Select a fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {Array.from({ length: 10 }, (_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: no other key available
              <SelectItem key={i} value={`${i + 1}`}>
                {i + 1}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <span className="text-sm font-medium">{getFrequencyLabel}</span>
    </div>
  )
})

export default IntervalSelector
