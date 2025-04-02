import { z } from 'zod'

export const neulandEventSchema = z.object({
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
  location: z.string(),
  startTime: z.date({ required_error: 'Bitte geben Sie eine Startzeit ein' }),
  endTime: z.date({ required_error: 'Bitte geben Sie eine Endzeit ein' }),
  rrule: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const updateNeulandEventSchema = neulandEventSchema.omit({
  createdAt: true,
  updatedAt: true,
})

export const newNeulandEventSchema = neulandEventSchema.omit({
  id: true,
})

export type NeulandEvent = z.infer<typeof neulandEventSchema>
export type UpdateNeulandEvent = z.infer<typeof updateNeulandEventSchema>
export type NewNeulandEvent = z.infer<typeof newNeulandEventSchema>
