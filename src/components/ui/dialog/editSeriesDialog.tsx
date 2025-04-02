import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { DateTimePicker } from '@/components/ui/datetimepicker'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import WeekdaySelector from '@/components/weekdaySelector'
import { useRecurrences } from '@/lib/providers/recurrenceProvider'
import { useCallback, useState } from 'react'
import { Frequency } from 'rrule'

interface EditSeriesDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  startDate: Date
  onStartDateChange: (date: Date) => void
}

export default function EditSeriesDialog({
  isOpen,
  onOpenChange,
  startDate,
  onStartDateChange,
}: EditSeriesDialogProps) {
  // direct approach does not work with form watch and setValue
  const [startDateValue, setStartDateValue] = useState<Date | undefined>(
    startDate
  )

  const { recurrence, changeRecurrence } = useRecurrences()

  const handleStartDateChange = useCallback(
    (date: Date | undefined) => {
      setStartDateValue(date)
      onStartDateChange(date || new Date())
    },
    [onStartDateChange]
  )

  return (
    <Dialog open={true && isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Wiederkehrendes Event bearbeiten</DialogTitle>
        </DialogHeader>

        <FormItem>
          <FormLabel>Startdatum</FormLabel>
          <FormControl>
            <DateTimePicker
              value={startDateValue}
              onChange={handleStartDateChange}
              granularity="day"
            />
          </FormControl>
          <FormMessage />
        </FormItem>

        <Tabs
          defaultValue={`${recurrence.frequency}`}
          className="w-full min-h-[600px]"
          onValueChange={(value) => {
            changeRecurrence({ frequency: Number.parseInt(value) })
          }}
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value={`${Frequency.DAILY}`}>Täglich</TabsTrigger>
            <TabsTrigger value={`${Frequency.WEEKLY}`}>Wöchentlich</TabsTrigger>
            <TabsTrigger value={`${Frequency.MONTHLY}`}>Monatlich</TabsTrigger>
            <TabsTrigger value={`${Frequency.YEARLY}`}>Jährlich</TabsTrigger>
          </TabsList>
          <TabsContent value={`${Frequency.DAILY}`}>
            <Card>
              <CardHeader>
                <CardTitle>Täglich</CardTitle>
                <CardDescription>TODO rrule hier generieren</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                        {Array.from({ length: 7 }, (_, i) => (
                          // biome-ignore lint/suspicious/noArrayIndexKey: no other key available
                          <SelectItem key={i} value={`${i + 1}`}>
                            {i + 1}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <span className="text-sm font-medium">
                    Tag{recurrence.interval !== 1 && 'e'}
                  </span>
                </div>

                {recurrence.interval === 1 && <WeekdaySelector />}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value={`${Frequency.WEEKLY}`}>
            <Card>
              <CardHeader>
                <CardTitle>Wöchentlich</CardTitle>
                <CardDescription>TODO rrule hier generieren</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                        {Array.from({ length: 7 }, (_, i) => (
                          // biome-ignore lint/suspicious/noArrayIndexKey: no other key available
                          <SelectItem key={i} value={`${i + 1}`}>
                            {i + 1}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <span className="text-sm font-medium">
                    Woche{recurrence.interval !== 1 && 'n'}
                  </span>
                </div>

                <WeekdaySelector />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        {/* <pre>
          <code className="text-sm">
            {JSON.stringify(existingEvent?.rrule, null, 2)}
          </code>
        </pre>

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
                        monthlyPattern: value as 'day-of-month' | 'day-of-week',
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
                  <Label htmlFor="on-date" className="w-fit">
                    Am Datum
                  </Label>
                  <DateTimePicker
                    onChange={(date) =>
                      setRecurrenceValues((prev) => ({
                        ...prev,
                        until: date,
                      }))
                    }
                    value={recurrenceValues.until}
                    granularity="day"
                    hourCycle={24}
                    disabled={recurrenceValues.endType !== 'on-date'}
                  />
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
        )} */}
      </DialogContent>
    </Dialog>
  )
}
