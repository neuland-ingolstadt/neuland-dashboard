import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { TimePickerInput } from '@/components/ui/timePickerInput'
import { cn } from '@/lib/utils'
import { Clock, X } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'

interface TimePickerProps {
  onValueChange: (value: string | null) => void
  value: string | null
}

export default function TimePicker({ onValueChange, value }: TimePickerProps) {
  const minuteRef = useRef<HTMLInputElement>(null)
  const hourRef = useRef<HTMLInputElement>(null)

  const [open, setOpen] = useState(false)

  const [selectedDate, updateSelectedDate] = useState<Date | undefined>(
    new Date()
  )

  const setTime = useCallback(
    (date: Date | undefined) => {
      if (!date) {
        updateSelectedDate(undefined)
        onValueChange(null)
        return
      }

      updateSelectedDate(date)
      onValueChange(
        date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
      )
    },
    [onValueChange]
  )

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
    >
      <PopoverTrigger asChild>
        <div className="relative">
          <Button
            variant="outline"
            className={cn('flex w-full justify-start text-left font-normal', {
              'text-muted-foreground': !value,
            })}
            onClick={(e) => {
              e.preventDefault()
              setOpen(true)
            }}
          >
            <Clock className="mr-2 h-4 w-4" />
            <span className="flex-1">{value || 'Uhrzeit'}</span>
          </Button>

          {value && (
            <Button
              size="icon"
              variant="secondary"
              className="absolute right-2 top-1/2 h-6 w-6 -translate-y-1/2 transform"
              onClick={(e) => {
                e.stopPropagation()
                setTime(undefined)
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </PopoverTrigger>

      <PopoverContent className="flex w-fit flex-row items-center">
        <div className="mr-12 flex items-center gap-2 text-gray-700">
          <Clock className="h-5 w-5" />
          <p className="text-sm font-medium">Uhrzeit</p>
        </div>

        <div className="flex items-center gap-2 font-medium">
          <TimePickerInput
            picker="hours"
            date={selectedDate}
            setDate={setTime}
            ref={hourRef}
            onRightFocus={() => minuteRef.current?.focus()}
          />
          <span>:</span>
          <TimePickerInput
            picker="minutes"
            date={selectedDate}
            setDate={setTime}
            ref={minuteRef}
            onLeftFocus={() => hourRef.current?.focus()}
            onSubmit={() => {
              setOpen(false)
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
