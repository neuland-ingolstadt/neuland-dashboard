import { z } from 'zod'

const isNotPastDate = (date: Date) => {
  const now = new Date()
  return date >= now
}

export const announcementSchema = z.object({
  id: z.string(),
  title: z.object({
    de: z.string({ required_error: 'Bitte geben Sie einen Titel ein' }),
    en: z.string({ required_error: 'Bitte geben Sie einen Titel ein' }),
  }),
  description: z.object({
    de: z.string({
      required_error: 'Bitte geben Sie eine Beschreibung ein',
      invalid_type_error: 'Bitte geben Sie eine Beschreibung ein',
    }),
    en: z.string({
      required_error: 'Bitte geben Sie eine Beschreibung ein',
      invalid_type_error: 'Bitte geben Sie eine Beschreibung ein',
    }),
  }),
  startDateTime: z.preprocess(
    (val) => {
      if (typeof val === 'string' || val instanceof Date) {
        return new Date(val)
      }
    },
    z
      .date({
        required_error: 'Bitte geben Sie eine Start Zeit ein',
      })
      .refine(isNotPastDate, {
        message: 'Das Startdatum muss in der Zukunft liegen',
      })
  ),
  endDateTime: z.preprocess(
    (val) => {
      if (typeof val === 'string' || val instanceof Date) {
        return new Date(val)
      }
    },
    z
      .date({
        required_error: 'Bitte geben Sie eine End Zeit ein',
      })
      .refine(isNotPastDate, {
        message: 'Das Enddatum muss in der Zukunft liegen',
      })
  ),

  priority: z
    .number({
      required_error: 'Bitte geben Sie eine Priorität ein',
      invalid_type_error: 'Bitte geben Sie eine Priorität ein',
    })
    .default(0),
  url: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const updateAnnouncementSchema = announcementSchema.omit({
  createdAt: true,
  updatedAt: true,
})

export const newAnnouncementSchema = updateAnnouncementSchema.omit({
  id: true,
})

export type Announcement = z.infer<typeof announcementSchema>
export type UpdateAnnouncement = z.infer<typeof updateAnnouncementSchema>
export type NewAnnouncement = z.infer<typeof newAnnouncementSchema>
