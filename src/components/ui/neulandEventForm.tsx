import { useState, useMemo, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Frequency, type Options, RRule, type Weekday } from 'rrule'
import { addHours, format } from 'date-fns'
import { Calendar } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Form,
} from '@/components/ui/form'
import RequiredLabel from '@/components/ui/required'
import { DateTimePicker } from '@/components/ui/datetimepicker'
import {
  type NewNeulandEvent,
  newNeulandEventSchema,
} from '@/lib/backend/neulandEvents'
import { Switch } from '@/components/ui/switch'

type RecurrenceFormValues = {
  isRecurring: boolean
  frequency: Frequency
  interval: number
  weekdays: number[]
  monthDay: number
  monthlyPattern: string
  monthlyWeekNum: string
  monthlyWeekday: string
  endType: string
  count: number | null
  until: string
}

const INITIAL_RECURRENCE_VALUES: RecurrenceFormValues = {
  isRecurring: false,
  frequency: Frequency.DAILY,
  interval: 1,
  weekdays: [],
  monthDay: 1,
  monthlyPattern: 'day-of-month',
  monthlyWeekNum: '1',
  monthlyWeekday: '1',
  endType: 'never',
  count: null,
  until: '',
}

const WEEKDAYS = [
  { value: RRule.MO.weekday, label: 'Montag', shortLabel: 'Mo' },
  { value: RRule.TU.weekday, label: 'Dienstag', shortLabel: 'Di' },
  { value: RRule.WE.weekday, label: 'Mittwoch', shortLabel: 'Mi' },
  { value: RRule.TH.weekday, label: 'Donnerstag', shortLabel: 'Do' },
  { value: RRule.FR.weekday, label: 'Freitag', shortLabel: 'Fr' },
  { value: RRule.SA.weekday, label: 'Samstag', shortLabel: 'Sa' },
  { value: RRule.SU.weekday, label: 'Sonntag', shortLabel: 'So' },
]

export default function NeulandEventForm() {
  const [recurrenceValues, setRecurrenceValues] =
    useState<RecurrenceFormValues>(INITIAL_RECURRENCE_VALUES)

  const form = useForm<NewNeulandEvent>({
    resolver: zodResolver(newNeulandEventSchema),
    defaultValues: {
      title: { de: '', en: '' },
      description: { de: '', en: '' },
      location: '',
      startTime: new Date(),
      endTime: addHours(new Date(), 1),
      rrule: null,
    },
  })

  const handleWeekdayChange = useCallback(
    (weekday: number, checked: boolean) => {
      setRecurrenceValues((prev) => ({
        ...prev,
        weekdays: checked
          ? [...prev.weekdays, weekday]
          : prev.weekdays.filter((day) => day !== weekday),
      }))
    },
    []
  )

  const getWeekdayFromIndex = useCallback((index: number): Weekday => {
    switch (index) {
      case 0:
        return RRule.SU
      case 1:
        return RRule.MO
      case 2:
        return RRule.TU
      case 3:
        return RRule.WE
      case 4:
        return RRule.TH
      case 5:
        return RRule.FR
      case 6:
        return RRule.SA
      default:
        return RRule.MO
    }
  }, [])

  const getFrequencyLabel = useCallback(
    (frequency: Frequency, count: number): string => {
      switch (frequency) {
        case Frequency.DAILY:
          return count > 1 ? 'Tage' : 'Tag'
        case Frequency.WEEKLY:
          return count > 1 ? 'Wochen' : 'Woche'
        case Frequency.MONTHLY:
          return count > 1 ? 'Monate' : 'Monat'
        case Frequency.YEARLY:
          return count > 1 ? 'Jahre' : 'Jahr'
        default:
          return ''
      }
    },
    []
  )

  const rrule = useMemo(() => {
    if (!recurrenceValues.isRecurring) {
      return null
    }

    try {
      const startTime = form.getValues('startTime')
      if (!startTime) {
        return null
      }

      const options: Partial<Options> = {
        dtstart: startTime,
        freq: recurrenceValues.frequency,
        interval: recurrenceValues.interval,
      }

      if (
        recurrenceValues.frequency === Frequency.WEEKLY &&
        recurrenceValues.weekdays.length > 0
      ) {
        options.byweekday = recurrenceValues.weekdays.map((day) => {
          const weekday = WEEKDAYS.find((w) => w.value === day)
          return weekday
            ? getWeekdayFromIndex(weekday.value)
            : WEEKDAYS[0].value
        })
      }

      if (recurrenceValues.frequency === Frequency.MONTHLY) {
        if (recurrenceValues.monthlyPattern === 'day-of-month') {
          options.bymonthday = recurrenceValues.monthDay
        } else if (recurrenceValues.monthlyPattern === 'day-of-week') {
          const weekdayIndex = Number.parseInt(recurrenceValues.monthlyWeekday)
          options.byweekday = getWeekdayFromIndex(weekdayIndex)
          options.bysetpos = Number.parseInt(recurrenceValues.monthlyWeekNum)
        }
      }

      if (recurrenceValues.endType === 'after' && recurrenceValues.count) {
        options.count = recurrenceValues.count
      } else if (
        recurrenceValues.endType === 'on-date' &&
        recurrenceValues.until
      ) {
        options.until = new Date(recurrenceValues.until)
      }

      return new RRule(options)
    } catch (error) {
      console.error('Error generating RRule:', error)
      return null
    }
  }, [recurrenceValues, form, getWeekdayFromIndex])

  const rruleText = useMemo(() => {
    if (!rrule) {
      return null
    }

    try {
      return rrule.toString()
    } catch (error) {
      console.error('Error generating RRule string:', error)
      return null
    }
  }, [rrule])

  const handleEndTypeChange = useCallback(
    (value: string) => {
      const newValues = { ...recurrenceValues, endType: value }

      if (value === 'never') {
        newValues.count = null
        newValues.until = ''
      } else if (value === 'after' && !newValues.count) {
        newValues.count = 1
        newValues.until = ''
      } else if (value === 'on-date' && !newValues.until) {
        newValues.count = null
        newValues.until = format(new Date(), 'yyyy-MM-dd')
      }

      setRecurrenceValues(newValues)
    },
    [recurrenceValues]
  )

  const onSubmit = useCallback(
    (data: NewNeulandEvent) => {
      const finalData = {
        ...data,
        rrule: rruleText,
        updatedAt: new Date().toISOString(),
      }

      console.log('Formular abgeschickt:', finalData)
    },
    [rruleText]
  )
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-2"
      >
        <h2 className="mt-6 text-xl font-bold tracking-tight">Beschreibung</h2>
        <div className="grid grid-cols-2 auto-rows-auto gap-6">
          <FormField
            control={form.control}
            name="title.de"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Titel (Deutsch)
                  <RequiredLabel />
                </FormLabel>
                <FormControl>
                  <Input placeholder="Titel" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="title.en"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Titel (Englisch) <RequiredLabel />
                </FormLabel>
                <FormControl>
                  <Input placeholder="Titel" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description.de"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Beschreibung (Deutsch) <RequiredLabel />
                </FormLabel>

                <FormControl>
                  <Textarea {...field} value={field.value ?? ''} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description.en"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Beschreibung (Englisch) <RequiredLabel />
                </FormLabel>

                <FormControl>
                  <Textarea {...field} value={field.value ?? ''} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ort</FormLabel>
              <FormControl>
                <Input placeholder="Veranstaltungsort" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <h2 className="mt-6 text-xl font-bold tracking-tight">Zeitraum</h2>

        <div className="grid gap-4 grid-cols-2">
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Startzeit <RequiredLabel />
                </FormLabel>

                <FormControl>
                  <DateTimePicker
                    onChange={field.onChange}
                    value={field.value}
                    granularity="minute"
                    hourCycle={24}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Endzeit <RequiredLabel />
                </FormLabel>

                <FormControl>
                  <DateTimePicker
                    onChange={field.onChange}
                    value={field.value}
                    granularity="minute"
                    hourCycle={24}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex items-center space-x-2 mt-6 mb-3">
          <Switch
            id="is-recurring"
            checked={recurrenceValues.isRecurring}
            onCheckedChange={(checked) =>
              setRecurrenceValues((prev) => ({
                ...prev,
                isRecurring: checked === true,
              }))
            }
          />
          <Label htmlFor="is-recurring">
            Dies ist eine wiederkehrende Veranstaltung
          </Label>
        </div>

        {recurrenceValues.isRecurring && (
          <div className="space-y-4 border rounded-md p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="frequency">Häufigkeit</Label>
                <Select
                  value={recurrenceValues.frequency.toString()}
                  onValueChange={(value) =>
                    setRecurrenceValues((prev) => ({
                      ...prev,
                      frequency: Number.parseInt(value) as Frequency,
                    }))
                  }
                >
                  <SelectTrigger id="frequency">
                    <SelectValue placeholder="Häufigkeit auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={`${Frequency.DAILY}`}>
                      Täglich
                    </SelectItem>
                    <SelectItem value={`${Frequency.WEEKLY}`}>
                      Wöchentlich
                    </SelectItem>
                    <SelectItem value={`${Frequency.MONTHLY}`}>
                      Monatlich
                    </SelectItem>
                    <SelectItem value={`${Frequency.YEARLY}`}>
                      Jährlich
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="interval">Wiederhole alle</Label>
                <div className="flex items-center gap-4 w-full">
                  <Input
                    id="interval"
                    type="number"
                    min={1}
                    value={recurrenceValues.interval}
                    onChange={(e) =>
                      setRecurrenceValues((prev) => ({
                        ...prev,
                        interval: Number.parseInt(e.target.value) || 1,
                      }))
                    }
                    className="w-full"
                  />
                  <span className="w-32">
                    {getFrequencyLabel(
                      recurrenceValues.frequency,
                      recurrenceValues.interval
                    )}
                  </span>
                </div>
              </div>
            </div>

            {recurrenceValues.frequency === Frequency.WEEKLY && (
              <div className="grid gap-2">
                <Label>Wiederhole am</Label>
                <div className="flex flex-wrap gap-2">
                  {WEEKDAYS.map((day) => (
                    <div
                      key={day.value}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`weekday-${day.value}`}
                        checked={recurrenceValues.weekdays.includes(day.value)}
                        onCheckedChange={(checked) =>
                          handleWeekdayChange(day.value, checked === true)
                        }
                      />
                      <Label htmlFor={`weekday-${day.value}`}>
                        {day.shortLabel}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {recurrenceValues.frequency === Frequency.MONTHLY && (
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label>Monatliches Wiederholungsmuster</Label>
                  <RadioGroup
                    value={recurrenceValues.monthlyPattern}
                    onValueChange={(value) =>
                      setRecurrenceValues((prev) => ({
                        ...prev,
                        monthlyPattern: value,
                      }))
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="day-of-month" id="day-of-month" />
                      <Label htmlFor="day-of-month">Jeden</Label>
                      <Input
                        id="month-day"
                        type="number"
                        min={1}
                        max={31}
                        value={recurrenceValues.monthDay}
                        onChange={(e) =>
                          setRecurrenceValues((prev) => ({
                            ...prev,
                            monthDay: Number.parseInt(e.target.value) || 1,
                          }))
                        }
                        className="w-20 ml-2"
                        disabled={
                          recurrenceValues.monthlyPattern !== 'day-of-month'
                        }
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="day-of-week" id="day-of-week" />
                      <Label htmlFor="day-of-week">Jeden</Label>
                      <Select
                        value={recurrenceValues.monthlyWeekNum}
                        onValueChange={(value) =>
                          setRecurrenceValues((prev) => ({
                            ...prev,
                            monthlyWeekNum: value,
                          }))
                        }
                        disabled={
                          recurrenceValues.monthlyPattern !== 'day-of-week'
                        }
                      >
                        <SelectTrigger className="w-24 ml-2">
                          <SelectValue placeholder="Auswählen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Ersten</SelectItem>
                          <SelectItem value="2">Zweiten</SelectItem>
                          <SelectItem value="3">Dritten</SelectItem>
                          <SelectItem value="4">Vierten</SelectItem>
                          <SelectItem value="-1">Letzten</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select
                        value={recurrenceValues.monthlyWeekday}
                        onValueChange={(value) =>
                          setRecurrenceValues((prev) => ({
                            ...prev,
                            monthlyWeekday: value,
                          }))
                        }
                        disabled={
                          recurrenceValues.monthlyPattern !== 'day-of-week'
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Tag auswählen" />
                        </SelectTrigger>
                        <SelectContent>
                          {WEEKDAYS.map((day) => (
                            <SelectItem
                              key={day.value}
                              value={`${day.value + 1}`}
                            >
                              {day.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <span>des Monats</span>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            )}

            <div className="grid gap-2">
              <Label>Endet</Label>
              <RadioGroup
                value={recurrenceValues.endType}
                onValueChange={handleEndTypeChange}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="never" id="never" />
                  <Label htmlFor="never">Nie</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="after" id="after" />
                  <Label htmlFor="after">Nach</Label>
                  <Input
                    type="number"
                    min={1}
                    value={recurrenceValues.count || ''}
                    onChange={(e) =>
                      setRecurrenceValues((prev) => ({
                        ...prev,
                        count: Number.parseInt(e.target.value) || null,
                      }))
                    }
                    className="w-20 ml-2"
                    placeholder="1"
                    disabled={recurrenceValues.endType !== 'after'}
                  />
                  <span>Wiederholungen</span>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="on-date" id="on-date" />
                  <Label htmlFor="on-date">Am Datum</Label>
                  <div className="relative ml-2">
                    <Input
                      type="date"
                      value={recurrenceValues.until}
                      onChange={(e) =>
                        setRecurrenceValues((prev) => ({
                          ...prev,
                          until: e.target.value,
                        }))
                      }
                      className="w-40"
                      disabled={recurrenceValues.endType !== 'on-date'}
                    />
                    <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </RadioGroup>
            </div>
          </div>
        )}

        {recurrenceValues.isRecurring && (
          <div className="mt-6 p-4 bg-muted rounded-md">
            <Label className="block mb-2 font-medium">RRULE Vorschau:</Label>
            <div className="p-3 bg-background border rounded-md overflow-x-auto">
              <code className="text-sm">
                {rruleText || 'Keine gültige Wiederholungsregel'}
              </code>
            </div>
          </div>
        )}
      </form>
    </Form>
  )
}
