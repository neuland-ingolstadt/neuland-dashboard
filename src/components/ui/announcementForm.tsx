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
import { MultiSelect } from '@/components/ui/multiSelect'
import RequiredLabel from '@/components/ui/required'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  type Announcement,
  type NewAnnouncement,
  newAnnouncementSchema,
} from '@/lib/backend/announcements'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  BriefcaseBusiness,
  FlaskConical,
  Globe,
  GraduationCap,
  User,
} from 'lucide-react'
import { forwardRef, useImperativeHandle } from 'react'
import { useForm } from 'react-hook-form'
import { SiAndroid, SiIos } from 'react-icons/si'
import AnnouncementPreviewCard from './announcementPreviewCard'

interface AnnouncementFormProps {
  onSubmit: (data: NewAnnouncement) => void
  defaultValues?: NewAnnouncement
}

type Platform = {
  label: string
  value: Announcement['platform'][number]
  icon: React.ComponentType<{ className?: string }>
}

type UserKind = {
  label: string
  value: Announcement['userKind'][number]
  icon: React.ComponentType<{ className?: string }>
}

export const platforms: Platform[] = [
  {
    value: 'ANDROID',
    label: 'Android',
    icon: SiAndroid,
  },
  {
    value: 'IOS',
    label: 'iOS',
    icon: SiIos,
  },
  {
    value: 'WEB',
    label: 'Web',
    icon: Globe,
  },
  {
    value: 'WEB_DEV',
    label: 'Web Dev',
    icon: FlaskConical,
  },
]

const defaultPlatformValues = platforms.map((platform) => platform.value)

export const userKinds: UserKind[] = [
  {
    value: 'STUDENT',
    label: 'Student',
    icon: GraduationCap,
  },
  {
    value: 'EMPLOYEE',
    label: 'Mitarbeiter',
    icon: BriefcaseBusiness,
  },
  {
    value: 'GUEST',
    label: 'Gast',
    icon: User,
  },
]

const defaultUserKindValues = userKinds.map((kind) => kind.value)

export interface AnnouncementFormRef {
  triggerSubmit: () => void
}

const AnnouncementForm = forwardRef<AnnouncementFormRef, AnnouncementFormProps>(
  ({ onSubmit, defaultValues }, ref) => {
    const form = useForm<NewAnnouncement>({
      resolver: zodResolver(newAnnouncementSchema),
      defaultValues: {
        ...defaultValues,
        platform: defaultValues?.platform ?? defaultPlatformValues,
        userKind: defaultValues?.userKind ?? defaultUserKindValues,
        url: defaultValues?.url ?? null,
        imageUrl: defaultValues?.imageUrl ?? null,
      },
    })

    useImperativeHandle(ref, () => ({
      triggerSubmit: () => {
        form.handleSubmit(onSubmit)()
      },
    }))

    const [title, description, imageUrl, url] = form.watch([
      'title',
      'description',
      'imageUrl',
      'url',
    ])
    const formData = {
      title,
      description,
      imageUrl,
      url,
    }

    return (
      <Form {...form}>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-2 md:col-span-2"
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
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <h2 className="mt-6 text-xl font-bold tracking-tight">Titel</h2>
            <div className="grid grid-cols-2 gap-6" />
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
                        className="min-h-64"
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
                        className="min-h-64"
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
                      <Input {...field} value={field.value ?? ''} type="url" />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Bild URL</FormLabel>

                    <FormControl>
                      <Input {...field} value={field.value ?? ''} type="url" />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <h2 className="mt-6 text-xl font-bold tracking-tight">
              Zielgruppe
            </h2>

            <div className="flex flex-col gap-3">
              <FormField
                control={form.control}
                name="platform"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>
                      Plattform <RequiredLabel />
                    </FormLabel>

                    <FormControl>
                      <MultiSelect
                        onValueChange={field.onChange}
                        value={field.value}
                        options={platforms}
                        defaultValue={defaultPlatformValues}
                        placeholder="Plattform auswählen"
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="userKind"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>
                      Nutzergruppe <RequiredLabel />
                    </FormLabel>

                    <FormControl>
                      <MultiSelect
                        onValueChange={field.onChange}
                        value={field.value}
                        options={userKinds}
                        defaultValue={defaultUserKindValues}
                        placeholder="Nutzergruppe auswählen"
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

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
                        onChange={(e) => {
                          field.onChange(Number.parseInt(e.target.value, 10))
                        }}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
          <div className="md:col-span-1 md:mt-[calc(2rem+24px)]">
            <Tabs defaultValue="de">
              <TabsList className="w-full">
                <TabsTrigger className="w-full" value="de">
                  Deutsch
                </TabsTrigger>
                <TabsTrigger className="w-full" value="en">
                  English
                </TabsTrigger>
              </TabsList>

              <TabsContent value="de">
                <AnnouncementPreviewCard
                  formData={formData}
                  displayLanguage="de"
                />
              </TabsContent>

              <TabsContent value="en">
                <AnnouncementPreviewCard
                  formData={formData}
                  displayLanguage="en"
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </Form>
    )
  }
)

AnnouncementForm.displayName = 'AnnouncementForm'
export default AnnouncementForm
