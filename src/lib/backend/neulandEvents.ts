import { z } from 'zod'

export const neulandEventSchema = z.object({
  id: z.string(),
  title: z.object({
    de: z.string({ required_error: 'Bitte geben Sie einen Titel ein' }),
    en: z.string({ required_error: 'Bitte geben Sie einen Titel ein' }),
  }),
  description: z
    .object({
      de: z
        .string({
          required_error: 'Bitte geben Sie eine Beschreibung ein',
          invalid_type_error: 'Bitte geben Sie eine Beschreibung ein',
        })
        .nullable(),
      en: z
        .string({
          required_error: 'Bitte geben Sie eine Beschreibung ein',
          invalid_type_error: 'Bitte geben Sie eine Beschreibung ein',
        })
        .nullable(),
    })
    .nullable(),
  location: z.string(),
  startTime: z.preprocess(
    (val) => {
      if (typeof val === 'string' || val instanceof Date) {
        return new Date(val)
      }
    },
    z.date({
      required_error: 'Bitte geben Sie eine Startzeit ein',
    })
  ),
  endTime: z.preprocess(
    (val) => {
      if (typeof val === 'string' || val instanceof Date) {
        return new Date(val)
      }
    },
    z.date({
      required_error: 'Bitte geben Sie eine Endzeit ein',
    })
  ),
  rrule: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const updateNeulandEventSchema = neulandEventSchema.omit({
  createdAt: true,
  updatedAt: true,
})

export const newNeulandEventSchema = updateNeulandEventSchema.omit({
  id: true,
})

export type NeulandEvent = z.infer<typeof neulandEventSchema>
export type UpdateNeulandEvent = z.infer<typeof updateNeulandEventSchema>
export type NewNeulandEvent = z.infer<typeof newNeulandEventSchema>
