import { Button, buttonVariants } from '@/components/ui/button'
import type { CalendarProps } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { add, format } from 'date-fns'
import { de } from 'date-fns/locale'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
} from 'lucide-react'
import * as React from 'react'
import { useImperativeHandle, useRef } from 'react'
import { DayPicker } from 'react-day-picker'

// ---------- utils start ----------
/**
 * regular expression to check for valid hour format (01-23)
 */
function isValidHour(value: string) {
  return /^(0[0-9]|1[0-9]|2[0-3])$/.test(value)
}

/**
 * regular expression to check for valid minute format (00-59)
 */
function isValidMinuteOrSecond(value: string) {
  return /^[0-5][0-9]$/.test(value)
}

type GetValidNumberConfig = { max: number; min?: number; loop?: boolean }
type TimePickerType = 'minutes' | 'seconds' | 'hours'

function getValidNumber(
  value: string,
  { max, min = 0, loop = false }: GetValidNumberConfig
) {
  let numericValue = Number.parseInt(value, 10)

  if (!Number.isNaN(numericValue)) {
    if (!loop) {
      if (numericValue > max) numericValue = max
      if (numericValue < min) numericValue = min
    } else {
      if (numericValue > max) numericValue = min
      if (numericValue < min) numericValue = max
    }
    return numericValue.toString().padStart(2, '0')
  }

  return '00'
}

function getValidHour(value: string) {
  if (isValidHour(value)) return value
  return getValidNumber(value, { max: 23 })
}

function getValidMinuteOrSecond(value: string) {
  if (isValidMinuteOrSecond(value)) return value
  return getValidNumber(value, { max: 59 })
}

type GetValidArrowNumberConfig = {
  min: number
  max: number
  step: number
}

function getValidArrowNumber(
  value: string,
  { min, max, step }: GetValidArrowNumberConfig
) {
  let numericValue = Number.parseInt(value, 10)
  if (!Number.isNaN(numericValue)) {
    numericValue += step
    return getValidNumber(String(numericValue), { min, max, loop: true })
  }
  return '00'
}

function getValidArrowHour(value: string, step: number) {
  return getValidArrowNumber(value, { min: 0, max: 23, step })
}

function getValidArrowMinuteOrSecond(value: string, step: number) {
  return getValidArrowNumber(value, { min: 0, max: 59, step })
}

function setMinutes(date: Date, value: string) {
  const minutes = getValidMinuteOrSecond(value)
  date.setMinutes(Number.parseInt(minutes, 10))
  return date
}

function setSeconds(date: Date, value: string) {
  const seconds = getValidMinuteOrSecond(value)
  date.setSeconds(Number.parseInt(seconds, 10))
  return date
}

function setHours(date: Date, value: string) {
  const hours = getValidHour(value)
  date.setHours(Number.parseInt(hours, 10))
  return date
}

function setDateByType(date: Date, value: string, type: TimePickerType) {
  switch (type) {
    case 'minutes':
      return setMinutes(date, value)
    case 'seconds':
      return setSeconds(date, value)
    case 'hours':
      return setHours(date, value)
    default:
      return date
  }
}

function getDateByType(date: Date | null, type: TimePickerType) {
  if (!date) return '00'
  switch (type) {
    case 'minutes':
      return getValidMinuteOrSecond(String(date.getMinutes()))
    case 'seconds':
      return getValidMinuteOrSecond(String(date.getSeconds()))
    case 'hours':
      return getValidHour(String(date.getHours()))
    default:
      return '00'
  }
}

function getArrowByType(value: string, step: number, type: TimePickerType) {
  switch (type) {
    case 'minutes':
      return getValidArrowMinuteOrSecond(value, step)
    case 'seconds':
      return getValidArrowMinuteOrSecond(value, step)
    case 'hours':
      return getValidArrowHour(value, step)
    default:
      return '00'
  }
}
// ---------- utils end ----------

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps & { yearRange?: number }) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        month: 'space-y-4',
        caption: 'flex justify-center pt-1 relative items-center',
        caption_label: 'text-sm font-medium',
        nav: 'space-x-1 flex items-center',
        nav_button: cn(
          buttonVariants({ variant: 'outline' }),
          'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100'
        ),
        nav_button_previous: 'absolute left-1',
        nav_button_next: 'absolute right-1',
        table: 'w-full border-collapse space-y-1',
        head_row: 'flex',
        head_cell:
          'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
        row: 'flex w-full mt-2',
        cell: 'h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
        day: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-9 w-9 p-0 font-normal aria-selected:opacity-100'
        ),
        day_range_end: 'day-range-end',
        day_selected:
          'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
        day_today: 'bg-accent text-accent-foreground',
        day_outside:
          'day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30',
        day_disabled: 'text-muted-foreground opacity-50',
        day_range_middle:
          'aria-selected:bg-accent aria-selected:text-accent-foreground',
        day_hidden: 'invisible',
        ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronLeft className="h-4 w-4" />,
        IconRight: () => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = 'Calendar'

interface TimePickerInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  picker: TimePickerType
  date?: Date | null
  onDateChange?: (date: Date | undefined) => void
  onRightFocus?: () => void
  onLeftFocus?: () => void
}

const TimePickerInput = React.forwardRef<
  HTMLInputElement,
  TimePickerInputProps
>(
  (
    {
      className,
      type = 'tel',
      value,
      id,
      name,
      date = new Date(new Date().setHours(0, 0, 0, 0)),
      onDateChange,
      onChange,
      onKeyDown,
      picker,
      onLeftFocus,
      onRightFocus,
      ...props
    },
    ref
  ) => {
    const [flag, setFlag] = React.useState<boolean>(false)

    /**
     * allow the user to enter the second digit within 2 seconds
     * otherwise start again with entering first digit
     */
    React.useEffect(() => {
      if (flag) {
        const timer = setTimeout(() => {
          setFlag(false)
        }, 2000)

        return () => clearTimeout(timer)
      }
    }, [flag])

    const calculatedValue = React.useMemo(() => {
      return getDateByType(date, picker)
    }, [date, picker])

    const calculateNewValue = (key: string) => {
      return !flag ? `0${key}` : calculatedValue.slice(1, 2) + key
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Tab') return
      e.preventDefault()
      if (e.key === 'ArrowRight') onRightFocus?.()
      if (e.key === 'ArrowLeft') onLeftFocus?.()
      if (['ArrowUp', 'ArrowDown'].includes(e.key)) {
        const step = e.key === 'ArrowUp' ? 1 : -1
        const newValue = getArrowByType(calculatedValue, step, picker)
        if (flag) setFlag(false)
        const tempDate = date ? new Date(date) : new Date()
        onDateChange?.(setDateByType(tempDate, newValue, picker))
      }
      if (e.key >= '0' && e.key <= '9') {
        const newValue = calculateNewValue(e.key)
        if (flag) onRightFocus?.()
        setFlag((prev) => !prev)
        const tempDate = date ? new Date(date) : new Date()
        onDateChange?.(setDateByType(tempDate, newValue, picker))
      }
    }

    return (
      <Input
        ref={ref}
        id={id || picker}
        name={name || picker}
        className={cn(
          'w-[48px] text-center font-mono text-base tabular-nums caret-transparent focus:bg-accent focus:text-accent-foreground [&::-webkit-inner-spin-button]:appearance-none',
          className
        )}
        value={value || calculatedValue}
        onChange={(e) => {
          e.preventDefault()
          onChange?.(e)
        }}
        type={type}
        inputMode="decimal"
        onKeyDown={(e) => {
          onKeyDown?.(e)
          handleKeyDown(e)
        }}
        {...props}
      />
    )
  }
)

TimePickerInput.displayName = 'TimePickerInput'

type Granularity = 'day' | 'hour' | 'minute' | 'second'
interface TimePickerProps {
  date?: Date | null
  onChange?: (date: Date | undefined) => void
  /**
   * Determines the smallest unit that is displayed in the datetime picker.
   * Default is 'second'.
   * */
  granularity?: Granularity
}

interface TimePickerRef {
  minuteRef: HTMLInputElement | null
  hourRef: HTMLInputElement | null
  secondRef: HTMLInputElement | null
}

const TimePicker = React.forwardRef<TimePickerRef, TimePickerProps>(
  ({ date, onChange, granularity = 'second' }, ref) => {
    const minuteRef = React.useRef<HTMLInputElement>(null)
    const hourRef = React.useRef<HTMLInputElement>(null)
    const secondRef = React.useRef<HTMLInputElement>(null)
    const periodRef = React.useRef<HTMLButtonElement>(null)

    useImperativeHandle(ref, () => ({
      minuteRef: minuteRef.current,
      hourRef: hourRef.current,
      secondRef: secondRef.current,
      periodRef: periodRef.current,
    }))

    return (
      <div className="flex items-center justify-center gap-2">
        <label htmlFor="datetime-picker-hour-input" className="cursor-pointer">
          <Clock className="mr-2 h-4 w-4" />
        </label>
        <TimePickerInput
          picker="hours"
          date={date}
          id="datetime-picker-hour-input"
          onDateChange={onChange}
          ref={hourRef}
          onRightFocus={() => minuteRef?.current?.focus()}
        />
        {(granularity === 'minute' || granularity === 'second') && (
          <>
            :
            <TimePickerInput
              picker="minutes"
              date={date}
              onDateChange={onChange}
              ref={minuteRef}
              onLeftFocus={() => hourRef?.current?.focus()}
              onRightFocus={() => secondRef?.current?.focus()}
            />
          </>
        )}
        {granularity === 'second' && (
          <>
            :
            <TimePickerInput
              picker="seconds"
              date={date}
              onDateChange={onChange}
              ref={secondRef}
              onLeftFocus={() => minuteRef?.current?.focus()}
              onRightFocus={() => periodRef?.current?.focus()}
            />
          </>
        )}
      </div>
    )
  }
)
TimePicker.displayName = 'TimePicker'

type DateTimePickerProps = {
  value?: Date
  onChange?: (date: Date | undefined) => void
  disabled?: boolean
  /** showing `AM/PM` or not. */
  placeholder?: string
  /**
   * The year range will be: `This year + yearRange` and `this year - yearRange`.
   * Default is 50.
   * For example:
   * This year is 2024, The year dropdown will be 1974 to 2024 which is generated by `2024 - 50 = 1974` and `2024 + 50 = 2074`.
   * */
  yearRange?: number
  /**
   * The format is derived from the `date-fns` documentation.
   * @reference https://date-fns.org/v3.6.0/docs/format
   **/
  displayFormat?: { hour24?: string; hour12?: string }
  /**
   * The granularity prop allows you to control the smallest unit that is displayed by DateTimePicker.
   * By default, the value is `second` which shows all time inputs.
   **/
  granularity?: Granularity
  className?: string
  showClearButton?: boolean
} & Pick<
  CalendarProps,
  'locale' | 'weekStartsOn' | 'showWeekNumber' | 'showOutsideDays'
>

type DateTimePickerRef = {
  value?: Date
} & Omit<HTMLButtonElement, 'value'>

const DateTimePicker = React.forwardRef<
  Partial<DateTimePickerRef>,
  DateTimePickerProps
>(
  (
    {
      locale = de,
      value,
      onChange,
      yearRange = 50,
      disabled = false,
      displayFormat,
      granularity = 'second',
      placeholder = 'Datum und Uhrzeit auswählen',
      className,
      showClearButton = false,
      ...props
    },
    ref
  ) => {
    const [month, setMonth] = React.useState<Date | undefined>(
      value ?? new Date()
    )
    const buttonRef = useRef<HTMLButtonElement>(null)
    /**
     * carry over the current time when a user clicks a new day
     * instead of resetting to 00:00
     */
    const handleSelect = (newDay: Date | undefined) => {
      if (!newDay) return
      if (!value) {
        onChange?.(newDay)
        setMonth(newDay)
        return
      }
      const diff = newDay.getTime() - value.getTime()
      const diffInDays = diff / (1000 * 60 * 60 * 24)
      const newDateFull = add(value, { days: Math.ceil(diffInDays) })
      onChange?.(newDateFull)
      setMonth(newDateFull)
    }

    useImperativeHandle(
      ref,
      () => ({
        ...buttonRef.current,
        value,
      }),
      [value]
    )

    const dateFormat = React.useMemo(() => {
      switch (granularity) {
        case 'hour':
          return 'PPP HH:mm'
        case 'minute':
          return 'PPP HH:mm'
        case 'second':
          return 'PPP HH:mm:ss'
        default:
          return 'PPPPP'
      }
    }, [granularity])

    let loc = de
    const { options, localize, formatLong } = locale
    if (options && localize && formatLong) {
      loc = {
        ...de,
        options,
        localize,
        formatLong,
      }
    }

    const [popoverOpen, setPopoverOpen] = React.useState(false)

    return (
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger
          asChild
          disabled={disabled}
          onClick={() => setPopoverOpen(true)}
        >
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !value && 'text-muted-foreground',
              className
            )}
            ref={buttonRef}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? (
              format(value, dateFormat, {
                locale: loc,
              })
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={value}
            month={month}
            onSelect={(d) => handleSelect(d)}
            onMonthChange={handleSelect}
            yearRange={yearRange}
            locale={locale}
            {...props}
          />
          {granularity !== 'day' && (
            <div className="border-t border-border p-3">
              <TimePicker
                onChange={onChange}
                date={value}
                granularity={granularity}
              />
            </div>
          )}

          {showClearButton && (
            <div className="border-t border-border">
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => {
                  // handleSelect(undefined)
                  setMonth(undefined)
                  onChange?.(undefined)
                  setPopoverOpen(false)
                }}
              >
                Löschen
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    )
  }
)

DateTimePicker.displayName = 'DateTimePicker'

export { DateTimePicker, TimePickerInput, TimePicker }
export type { TimePickerType, DateTimePickerProps, DateTimePickerRef }
