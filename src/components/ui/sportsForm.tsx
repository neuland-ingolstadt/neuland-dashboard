import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
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
import {
  type NewSportsEvent,
  newSportsEventSchema,
} from '@/lib/backend/sportEvents'
import { cn, sportsCategories, weekdays } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, ChevronsUpDown } from 'lucide-react'
import { forwardRef, useImperativeHandle } from 'react'
import { useForm } from 'react-hook-form'

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
        description: {
          de: defaultValues?.description?.de ?? '',
          en: defaultValues?.description?.en ?? '',
        },
        ...defaultValues,
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
                    <Input {...field} value={field.value ?? ''} />
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

                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger
                        className={cn({
                          'text-muted-foreground': !field.value,
                        })}
                      >
                        <SelectValue placeholder="Wochentag" />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      {Object.entries(weekdays).map(([key, value], idx) => (
                        <SelectItem key={key} value={key}>
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

          <div className="grid grid-cols-3 gap-3">
            <FormField
              control={form.control}
              name="campus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Campus <RequiredLabel />
                  </FormLabel>

                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger
                        className={cn({
                          'text-muted-foreground': !field.value,
                        })}
                      >
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
            <FormField
              control={form.control}
              name="sportsCategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Sportart <RequiredLabel />
                  </FormLabel>
                  <div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            // biome-ignore lint/a11y/useSemanticElements: official radix-ui component
                            role="combobox"
                            className={cn(
                              'justify-between w-full',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value
                              ? sportsCategories.find(
                                  (sport) => sport.value === field.value
                                )?.label
                              : 'Sportart auswählen'}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Sportart suchen" />
                          <CommandList>
                            <CommandEmpty>
                              Keine Sportarten gefunden
                            </CommandEmpty>
                            <CommandGroup>
                              {sportsCategories.map(({ value, label }) => (
                                <CommandItem
                                  value={label}
                                  key={value}
                                  className="w-full max-w-full"
                                  onSelect={() => {
                                    form.setValue('sportsCategory', value)
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      'mr-2 h-4 w-4',
                                      value === field.value
                                        ? 'opacity-100'
                                        : 'opacity-0'
                                    )}
                                  />
                                  {label}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

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
                  <FormLabel>Beschreibung (Deutsch)</FormLabel>

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
                  <FormLabel>Beschreibung (Englisch)</FormLabel>

                  <FormControl>
                    <Textarea {...field} value={field.value ?? ''} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={() => (
                <FormItem>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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
