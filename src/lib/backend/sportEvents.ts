import { z } from 'zod'

export const sportsEventSchema = z.object({
  id: z.string(),
  title: z.object({
    de: z.string({ required_error: 'Bitte geben Sie einen Titel ein' }),
    en: z.string({ required_error: 'Bitte geben Sie einen Titel ein' }),
  }),
  description: z
    .object({
      de: z.string({
        required_error: 'Bitte geben Sie eine Beschreibung ein',
        invalid_type_error: 'Bitte geben Sie eine Beschreibung ein',
      }),
      en: z.string({
        required_error: 'Bitte geben Sie eine Beschreibung ein',
        invalid_type_error: 'Bitte geben Sie eine Beschreibung ein',
      }),
    })
    .nullable(),
  campus: z.enum(['Ingolstadt', 'Neuburg'], {
    required_error: 'Bitte wählen sie einen Campus',
  }),
  location: z.string({
    required_error: 'Bitte geben Sie einen Ort ein',
    invalid_type_error: 'Bitte geben Sie einen Ort ein',
  }),
  weekday: z.enum(
    [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ],
    {
      required_error: 'Bitte wählen Sie einen Wochentag',
    }
  ),
  startTime: z.string({ required_error: 'Bitte geben Sie eine Startzeit ein' }),
  endTime: z.string().nullable(),
  requiresRegistration: z.boolean().default(true),
  invitationLink: z.string().nullable(),
  eMail: z.union([z.string().email(), z.null(), z.literal('')]),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const updateSportsEventSchema = sportsEventSchema.omit({
  createdAt: true,
  updatedAt: true,
})

export const newSportsEventSchema = updateSportsEventSchema.omit({
  id: true,
})

export type SportsEvent = z.infer<typeof sportsEventSchema>
export type UpdateSportsEvent = z.infer<typeof updateSportsEventSchema>
export type NewSportsEvent = z.infer<typeof newSportsEventSchema>
