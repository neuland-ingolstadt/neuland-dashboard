import { z } from "zod";
import { sportsCategoriesKeys } from "#/lib/utils";

const requiredText = (message: string) =>
	z
		.string({ required_error: message, invalid_type_error: message })
		.trim()
		.min(1, message);

const localTime = z
	.string({ required_error: "Bitte eine Startzeit angeben" })
	.trim()
	.regex(/^\d{1,2}:\d{2}(:\d{2})?$/, "Bitte eine gültige Uhrzeit angeben");

export const sportsEventSchema = z.object({
	id: z.string(),
	title: z.object({
		de: requiredText("Bitte einen deutschen Titel eingeben"),
		en: requiredText("Bitte einen englischen Titel eingeben"),
	}),
	description: z
		.object({
			de: z.string().optional(),
			en: z.string().optional(),
		})
		.partial()
		.refine(
			(data) => {
				const de = data.de?.trim() ?? "";
				const en = data.en?.trim() ?? "";
				return (de && en) || (!de && !en);
			},
			{
				message:
					"Bitte entweder beide Beschreibungen oder keine Beschreibung angeben",
				path: ["de"],
			},
		),
	campus: z.enum(["Ingolstadt", "Neuburg"], {
		required_error: "Bitte einen Campus wählen",
	}),
	location: requiredText("Bitte einen Ort eingeben"),
	weekday: z.enum(
		[
			"Monday",
			"Tuesday",
			"Wednesday",
			"Thursday",
			"Friday",
			"Saturday",
			"Sunday",
		],
		{
			required_error: "Bitte einen Wochentag wählen",
		},
	),
	startTime: localTime,
	endTime: z
		.union([
			z.literal("").transform(() => null),
			z
				.string()
				.trim()
				.regex(
					/^\d{1,2}:\d{2}(:\d{2})?$/,
					"Bitte eine gültige Uhrzeit angeben",
				),
			z.null(),
		])
		.nullable()
		.optional(),
	requiresRegistration: z.boolean().default(true),
	invitationLink: z.string().nullable(),
	eMail: z.union([
		z.string().email("Ungültige E-Mail"),
		z.null(),
		z.literal(""),
	]),
	sportsCategory: z.enum(sportsCategoriesKeys, {
		required_error: 'Bitte eine Sportart wählen oder "Sonstiges"',
	}),
});

export const updateSportsEventSchema = sportsEventSchema;

export const newSportsEventSchema = updateSportsEventSchema.omit({
	id: true,
});

export type SportsEvent = z.infer<typeof sportsEventSchema>;
export type UpdateSportsEvent = z.infer<typeof updateSportsEventSchema>;
export type NewSportsEvent = z.infer<typeof newSportsEventSchema>;
