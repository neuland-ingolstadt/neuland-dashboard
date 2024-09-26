import { z } from 'zod'

const sportsEventSchema = z.object({
  id: z.string(),
  title: z.object({
    de: z.string(),
    en: z.string(),
  }),
  description: z
    .object({
      de: z.string().nullable(),
      en: z.string().nullable(),
    })
    .nullable(),
  campus: z.enum(['Ingolstadt', 'Neuburg']),
  location: z.string(),
  weekday: z.enum([
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ]),
  startTime: z.string(),
  endTime: z.string().nullable(),
  requiresRegistration: z.boolean(),
  invitationLink: z.string().nullable(),
  eMail: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export async function parseSportEvents(data: unknown) {
  return await sportsEventSchema.array().parseAsync(data)
}

export type SportsEvent = z.infer<typeof sportsEventSchema>
