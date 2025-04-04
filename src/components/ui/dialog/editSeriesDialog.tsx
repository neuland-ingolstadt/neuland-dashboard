import IntervalSelector from '@/components/intervalSelector'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DateTimePicker } from '@/components/ui/datetimepicker'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import RecurrenceSelector from '@/components/ui/recurrenceSelector'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import WeekdaySelector from '@/components/weekdaySelector'
import { useRecurrence } from '@/lib/providers/recurrenceProvider'
import { useCallback, useMemo } from 'react'
import { Frequency } from 'rrule'

interface EditSeriesDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSave: (rrule: string) => void
}

export default function EditSeriesDialog({
  isOpen,
  onOpenChange,
  onSave,
}: EditSeriesDialogProps) {
  const {
    recurrence,
    changeRecurrence,
    startDate,
    onStartDateChange,
    rrule,
    restoreRecurrence,
  } = useRecurrence()

  const rruleText = useMemo(() => {
    return rrule?.toText() || ''
  }, [rrule])

  const onOpenChangeDialog = useCallback(
    (open: boolean) => {
      if (!open) {
        restoreRecurrence()
      }

      onOpenChange(open)
    },
    [onOpenChange, restoreRecurrence]
  )

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChangeDialog}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Wiederkehrendes Event bearbeiten</DialogTitle>
          <DialogDescription className="first-letter:capitalize">
            {rruleText}
          </DialogDescription>
        </DialogHeader>

        <FormItem>
          <FormLabel>Startdatum</FormLabel>
          <FormControl>
            <DateTimePicker
              value={startDate || undefined}
              onChange={(date) => {
                onStartDateChange(date || null)
              }}
              granularity="day"
            />
          </FormControl>
          <FormMessage />
        </FormItem>

        <Tabs
          defaultValue={`${recurrence.frequency}`}
          className="w-full "
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
            <Card className="h-72">
              <CardHeader>
                <CardTitle>Täglich</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <IntervalSelector frequency={Frequency.DAILY} />

                {recurrence.interval === 1 && <WeekdaySelector />}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value={`${Frequency.WEEKLY}`}>
            <Card className="h-72">
              <CardHeader>
                <CardTitle>Wöchentlich</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <IntervalSelector frequency={Frequency.WEEKLY} />

                <WeekdaySelector />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value={`${Frequency.MONTHLY}`}>
            <Card className="h-72">
              <CardHeader>
                <CardTitle>Monatlich</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <IntervalSelector frequency={Frequency.MONTHLY} />

                <RecurrenceSelector />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value={`${Frequency.YEARLY}`}>
            <Card className="h-72">
              <CardHeader>
                <CardTitle>Jährlich</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <IntervalSelector frequency={Frequency.YEARLY} />

                <RecurrenceSelector />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChangeDialog(false)}>
            Abbrechen
          </Button>
          <Button
            onClick={() => {
              onSave(rrule?.toString() || '')
              onOpenChange(false)
            }}
          >
            Änderungen speichern
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
