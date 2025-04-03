import IntervalSelector from '@/components/intervalSelector'
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
import RecurrenceSelector from '@/components/ui/recurrenceSelector'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import WeekdaySelector from '@/components/weekdaySelector'
import { useRecurrence } from '@/lib/providers/recurrenceProvider'
import { Frequency } from 'rrule'

interface EditSeriesDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export default function EditSeriesDialog({
  isOpen,
  onOpenChange,
}: EditSeriesDialogProps) {
  const { recurrence, changeRecurrence, startDate, onStartDateChange } =
    useRecurrence()

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
              value={startDate}
              onChange={onStartDateChange}
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
                <CardDescription>TODO rrule hier generieren</CardDescription>
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
                <CardDescription>TODO rrule hier generieren</CardDescription>
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
                <CardTitle>Wöchentlich</CardTitle>
                <CardDescription>TODO rrule hier generieren</CardDescription>
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
                <CardTitle>Wöchentlich</CardTitle>
                <CardDescription>TODO rrule hier generieren</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <IntervalSelector frequency={Frequency.YEARLY} />

                <RecurrenceSelector />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
