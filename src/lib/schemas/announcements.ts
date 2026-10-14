import { z } from "zod";

const isNotPastDate = (date: Date) => {
	const now = new Date();
	return date >= now;
};

export const announcementSchema = z.object({
	id: z.string(),
	title: z.object({
		de: z
			.string({ required_error: "Bitte einen Titel eingeben" })
			.trim()
			.min(1, "Bitte einen Titel eingeben"),
		en: z
			.string({ required_error: "Bitte einen Titel eingeben" })
			.trim()
			.min(1, "Bitte einen Titel eingeben"),
	}),
	description: z.object({
		de: z
			.string({
				required_error: "Bitte eine Beschreibung eingeben",
				invalid_type_error: "Bitte eine Beschreibung eingeben",
			})
			.trim()
			.min(1, "Bitte eine Beschreibung eingeben"),
		en: z
			.string({
				required_error: "Bitte eine Beschreibung eingeben",
				invalid_type_error: "Bitte eine Beschreibung eingeben",
			})
			.trim()
			.min(1, "Bitte eine Beschreibung eingeben"),
	}),
	startDateTime: z.preprocess(
		(val) => {
			if (typeof val === "string" || val instanceof Date) {
				return new Date(val);
			}
		},
		z.date({
			required_error: "Bitte geben Sie eine Startzeit ein",
		}),
	),
	endDateTime: z.preprocess(
		(val) => {
			if (typeof val === "string" || val instanceof Date) {
				return new Date(val);
			}
		},
		z
			.date({
				required_error: "Bitte geben Sie eine Endzeit ein",
			})
			.refine(isNotPastDate, {
				message: "Das Enddatum muss in der Zukunft liegen",
			}),
	),
	priority: z
		.number({
			required_error: "Bitte geben Sie eine Priorität ein",
			invalid_type_error: "Bitte geben Sie eine Priorität ein",
		})
		.default(0),
	url: z.string().nullable(),
	platform: z.enum(["WEB", "WEB_DEV", "IOS", "ANDROID"]).array().min(1, {
		message: "Bitte wählen Sie mindestens eine Plattform aus",
	}),
	userKind: z.enum(["STUDENT", "EMPLOYEE", "GUEST"]).array().min(1, {
		message: "Bitte wählen Sie mindestens eine Benutzergruppe aus",
	}),
	imageUrl: z.string().nullable(),
});

export const updateAnnouncementSchema = announcementSchema;

export const newAnnouncementSchema = updateAnnouncementSchema.omit({
	id: true,
});

export type Announcement = z.infer<typeof announcementSchema>;
export type UpdateAnnouncement = z.infer<typeof updateAnnouncementSchema>;
export type NewAnnouncement = z.infer<typeof newAnnouncementSchema>;
