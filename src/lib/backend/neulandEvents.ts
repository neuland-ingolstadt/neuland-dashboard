import { z } from 'zod'

const baseNeulandEventSchema = z.object({
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
  startTime: z
    .preprocess(
      (val) => {
        if (typeof val === 'string' || val instanceof Date) {
          return new Date(val)
        }
      },
      z.date({
        required_error: 'Bitte geben Sie eine Startzeit ein',
      })
    )
    .nullable(),
  endTime: z
    .preprocess(
      (val) => {
        if (typeof val === 'string' || val instanceof Date) {
          return new Date(val)
        }
      },
      z.date({
        required_error: 'Bitte geben Sie eine Endzeit ein',
      })
    )
    .nullable(),
  rrule: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const neulandEventSchema = baseNeulandEventSchema.superRefine(
  ({ startTime, endTime }, ctx) => {
    if (endTime && !startTime) {
      ctx.addIssue({
        code: 'custom',
        message: 'Bitte geben Sie ein Start- und Enddatum ein',
        path: ['startTime'],
      })
    }
  }
)

export const updateNeulandEventSchema = baseNeulandEventSchema
  .omit({
    createdAt: true,
    updatedAt: true,
  })
  .superRefine(({ startTime, endTime }, ctx) => {
    if (endTime && !startTime) {
      ctx.addIssue({
        code: 'custom',
        message: 'Bitte geben Sie ein Start- und Enddatum ein',
        path: ['startTime'],
      })
    }
  })

export const newNeulandEventSchema = baseNeulandEventSchema
  .omit({
    createdAt: true,
    updatedAt: true,
    id: true,
  })
  .superRefine(({ startTime, endTime }, ctx) => {
    if (endTime && !startTime) {
      ctx.addIssue({
        code: 'custom',
        message: 'Bitte geben Sie ein Start- und Enddatum ein',
        path: ['startTime'],
      })
    }

    if (startTime && endTime && endTime < startTime) {
      ctx.addIssue({
        code: 'custom',
        message: 'Endzeit muss nach Startzeit liegen',
        path: ['endTime'],
      })
    }
  })

export type NeulandEvent = z.infer<typeof neulandEventSchema>
export type UpdateNeulandEvent = z.infer<typeof updateNeulandEventSchema>
export type NewNeulandEvent = z.infer<typeof newNeulandEventSchema>
