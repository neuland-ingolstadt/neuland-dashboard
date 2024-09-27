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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import TimePicker from '@/components/ui/timePicker'
import { NewSportsEvent, newSportsEventSchema } from '@/lib/backend/sportEvents'
import { weekdays } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'

interface SportsFormProps {
  onSubmit: (data: NewSportsEvent) => void
  defaultValues?: NewSportsEvent
}

export interface SportsFormRef {
  triggerSubmit: () => void
}

const SportsForm = forwardRef<SportsFormRef, SportsFormProps>(
  ({ onSubmit, defaultValues }, ref) => {
    const form = useForm<NewSportsEvent>({
      resolver: zodResolver(newSportsEventSchema),
      defaultValues: {
        endTime: null,
        eMail: null,
        invitationLink: null,
        ...defaultValues,
      },
    })

    useImperativeHandle(ref, () => ({
      triggerSubmit: () => {
        form.handleSubmit(onSubmit)()
      },
    }))

    useEffect(() => {
      const description = defaultValues?.description
      if (description?.de === null && description?.en === null) {
        form.setValue('description', null)
        setDisableDescription(true)
      }
    }, [defaultValues, form])

    const [disableDescription, setDisableDescription] = useState(false)

    return (
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-2"
        >
          <div className="grid grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="title.de"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Veranstaltungstitel (Deutsch) <RequiredLabel />
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
                    Veranstaltungstitel (Englisch) <RequiredLabel />
                  </FormLabel>

                  <FormControl>
                    <Input {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <h2 className="mt-6 text-xl font-bold tracking-tight">Details</h2>
          <div className="grid grid-cols-3 gap-3">
            <FormField
              control={form.control}
              name="weekday"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Wochentag <RequiredLabel />
                  </FormLabel>

                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Wochentag" />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      {Object.entries(weekdays).map(([key, value], idx) => (
                        <SelectItem
                          key={idx}
                          value={key}
                        >
                          {value.de}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Startzeit <RequiredLabel />
                  </FormLabel>

                  <FormControl>
                    <TimePicker
                      onValueChange={field.onChange}
                      value={field.value}
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
                    <TimePicker
                      onValueChange={field.onChange}
                      value={field.value}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="campus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Campus <RequiredLabel />
                  </FormLabel>

                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Campus" />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      <SelectItem value="Ingolstadt">Ingolstadt</SelectItem>
                      <SelectItem value="Neuburg">Neuburg</SelectItem>
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Veranstaltungsort <RequiredLabel />
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
                      disabled={disableDescription}
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
                      disabled={disableDescription}
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="mt-2 flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                <FormControl>
                  <Checkbox
                    checked={disableDescription}
                    onCheckedChange={(value) => {
                      if (value) {
                        field.onChange(null)
                        setDisableDescription(true)
                      } else {
                        field.onChange({
                          de: null,
                          en: null,
                        })
                        setDisableDescription(false)
                      }
                    }}
                  />
                </FormControl>
                <FormLabel>Keine Beschreibung</FormLabel>
              </FormItem>
            )}
          />

          <h2 className="mt-6 text-xl font-bold tracking-tight">Anmeldung</h2>
          <FormField
            control={form.control}
            name="eMail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-Mail</FormLabel>

                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ''}
                    placeholder="E-Mail Adresse"
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="invitationLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Einladungslink</FormLabel>

                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ''}
                    placeholder="WhatsApp Gruppenlink"
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="requiresRegistration"
            render={({ field }) => (
              <FormItem className="mt-2 flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Anmeldung erforderlich</FormLabel>
              </FormItem>
            )}
          />
        </form>
      </Form>
    )
  }
)

SportsForm.displayName = 'SportsForm'
export default SportsForm
