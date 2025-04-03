import {
  useCallback,
  forwardRef,
  useImperativeHandle,
  useState,
  useMemo,
} from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { addHours } from 'date-fns'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Form,
  FormDescription,
} from '@/components/ui/form'
import RequiredLabel from '@/components/ui/required'
import { DateTimePicker } from '@/components/ui/datetimepicker'
import {
  type NewNeulandEvent,
  newNeulandEventSchema,
} from '@/lib/backend/neulandEvents'
import { RecurrencesProvider } from '@/lib/providers/recurrenceProvider'
import EditSeriesDialog from '@/components/ui/dialog/editSeriesDialog'
import { Switch } from '@/components/ui/switch'
import { rrulestr } from 'rrule'
import { Button } from '@/components/ui/button'
import { Edit } from 'lucide-react'

interface NeulandEventFormProps {
  onSubmit: (data: NewNeulandEvent) => void
  existingEvent?: NewNeulandEvent
}

export interface NeulandEventFormRef {
  triggerSubmit: () => void
}

const NeulandEventForm = forwardRef<NeulandEventFormRef, NeulandEventFormProps>(
  ({ onSubmit, existingEvent }, ref) => {
    const [isEditorOpen, setIsEditorOpen] = useState(false)

    const form = useForm<NewNeulandEvent>({
      resolver: zodResolver(newNeulandEventSchema),
      defaultValues: {
        title: {
          de: existingEvent?.title.de || '',
          en: existingEvent?.title.en || '',
        },
        description: {
          de: existingEvent?.description?.de || '',
          en: existingEvent?.description?.en || '',
        },
        location: '',
        startTime: new Date(),
        endTime: addHours(new Date(), 1),
        ...existingEvent,
        rrule: existingEvent?.rrule || null,
      },
    })

    const onFormSubmit = useCallback(
      (data: NewNeulandEvent) => {
        const finalData: NewNeulandEvent = {
          ...data,
          // rrule: rruleText,
        }

        onSubmit(finalData)
      },
      [onSubmit]
    )

    useImperativeHandle(ref, () => ({
      triggerSubmit: () => {
        form.handleSubmit(onFormSubmit)()
      },
    }))

    const rruleWatch = form.watch('rrule')

    const rruleText = useMemo(() => {
      if (!rruleWatch) return ''

      const rrule = rrulestr(rruleWatch)
      return rrule.toText()
    }, [rruleWatch])

    return (
      <Form {...form}>
        <RecurrencesProvider
          startDate={form.getValues('startTime')}
          onStartDateChange={(date) => {
            form.setValue('startTime', date)
          }}
          existingRrule={rruleWatch}
        >
          <EditSeriesDialog
            isOpen={isEditorOpen}
            onOpenChange={setIsEditorOpen}
            onSave={(rrule) => {
              form.setValue('rrule', rrule)
            }}
          />

          <form
            onSubmit={form.handleSubmit(onFormSubmit)}
            className="flex flex-col gap-2"
          >
            <h2 className="mt-6 text-xl font-bold tracking-tight">
              Beschreibung
            </h2>
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
                    <FormLabel>Beschreibung (Deutsch)</FormLabel>

                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value ?? ''}
                        className="h-48"
                      />
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
                    <FormLabel>Beschreibung (Englisch)</FormLabel>

                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value ?? ''}
                        className="h-48"
                      />
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
                    <FormLabel>Endzeit</FormLabel>

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

            <FormField
              control={form.control}
              name="rrule"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Wiederkehrendes Event
                    </FormLabel>
                    <FormDescription className="flex flex-row items-center gap-3">
                      <span className="first-letter:capitalize">
                        {rruleText}
                      </span>

                      {rruleWatch && (
                        <Button
                          className="!m-0 !p-0 h-6"
                          variant="link"
                          type="button"
                          onClick={() => setIsEditorOpen(true)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Bearbeiten
                        </Button>
                      )}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={!!field.value}
                      onCheckedChange={(checked) => {
                        if (!checked) {
                          field.onChange(null)
                          return
                        }

                        setIsEditorOpen(true)
                      }}
                      className="!mt-0"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </form>
        </RecurrencesProvider>
      </Form>
    )
  }
)

NeulandEventForm.displayName = 'NeulandEventForm'
export default NeulandEventForm
