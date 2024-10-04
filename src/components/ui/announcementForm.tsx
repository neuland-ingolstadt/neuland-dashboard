import { DateTimePicker } from '@/components/ui/datetimepicker'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import RequiredLabel from '@/components/ui/required'
import { Textarea } from '@/components/ui/textarea'
import {
  NewAnnouncement,
  newAnnouncementSchema,
} from '@/lib/backend/announcements'
import { zodResolver } from '@hookform/resolvers/zod'
import { forwardRef, useImperativeHandle } from 'react'
import { useForm } from 'react-hook-form'

interface AnnouncementFormProps {
  onSubmit: (data: NewAnnouncement) => void
  defaultValues?: NewAnnouncement
}

export interface AnnouncementFormRef {
  triggerSubmit: () => void
}

const AnnouncementForm = forwardRef<AnnouncementFormRef, AnnouncementFormProps>(
  ({ onSubmit, defaultValues }, ref) => {
    const form = useForm<NewAnnouncement>({
      resolver: zodResolver(newAnnouncementSchema),
      defaultValues: {
        ...defaultValues,
        url: defaultValues?.url ?? null,
      },
    })

    useImperativeHandle(ref, () => ({
      triggerSubmit: () => {
        form.handleSubmit(onSubmit)()
      },
    }))

    return (
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-2"
        >
          <h2 className="mt-6 text-xl font-bold tracking-tight">Zeitraum</h2>
          <div className="grid grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="startDateTime"
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
              name="endDateTime"
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
          <h2 className="mt-6 text-xl font-bold tracking-tight">Titel</h2>
          <div className="grid grid-cols-2 gap-6"></div>
          <div className="grid grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="title.de"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Titel (Deutsch) <RequiredLabel />
                  </FormLabel>

                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ''}
                    />
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
                    <Input {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <h2 className="mt-6 text-xl font-bold tracking-tight">
            Beschreibung
          </h2>
          <div className="grid grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="description.de"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Beschreibung (Deutsch) <RequiredLabel />
                  </FormLabel>

                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value ?? ''}
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
                  <FormLabel>
                    Beschreibung (Englisch) <RequiredLabel />
                  </FormLabel>

                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Link</FormLabel>

                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ''}
                      type="url"
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <h2 className="mt-6 text-xl font-bold tracking-tight">Priorität</h2>

          <div className="grid grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Priorität <RequiredLabel />
                  </FormLabel>

                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min={0}
                      max={10}
                      step={1}
                      defaultValue={0}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>
    )
  }
)

AnnouncementForm.displayName = 'AnnouncementForm'
export default AnnouncementForm
