import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "@tanstack/react-router";
import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { Button } from "#/components/ui/button";
import { Checkbox } from "#/components/ui/checkbox";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { formatUserError } from "#/lib/format-user-error";
import {
	type NewSportsEvent,
	newSportsEventSchema,
	type SportsEvent,
} from "#/lib/schemas/sports";
import {
	createSportFn,
	deleteSportFn,
	updateSportFn,
} from "#/lib/sports.functions";
import { formatTime, sportsCategories, weekdays } from "#/lib/utils";

type SportsFormProps = {
	mode: "create" | "edit";
	event?: SportsEvent;
};

function FieldError({ message, show }: { message?: string; show?: boolean }) {
	if (!show || !message) return null;
	return <p className="text-sm text-destructive">{message}</p>;
}

export function SportsForm({ mode, event }: SportsFormProps) {
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);
	const [pending, startTransition] = useTransition();

	const form = useForm<NewSportsEvent>({
		resolver: zodResolver(newSportsEventSchema),
		mode: "onTouched",
		reValidateMode: "onChange",
		defaultValues: {
			title: { de: event?.title.de ?? "", en: event?.title.en ?? "" },
			description: {
				de: event?.description?.de ?? "",
				en: event?.description?.en ?? "",
			},
			campus: event?.campus ?? "Ingolstadt",
			location: event?.location ?? "",
			weekday: event?.weekday ?? "Monday",
			startTime: formatTime(event?.startTime) || "",
			endTime: formatTime(event?.endTime) || null,
			requiresRegistration: event?.requiresRegistration ?? true,
			invitationLink: event?.invitationLink ?? null,
			eMail: event?.eMail ?? null,
			sportsCategory: event?.sportsCategory ?? "Other",
		},
	});

	const values = form.watch();
	const schemaValid = useMemo(
		() => newSportsEventSchema.safeParse(values).success,
		[values],
	);
	const { errors, touchedFields, isSubmitted } = form.formState;
	const canSubmit = schemaValid && !pending;

	const descDe = (values.description?.de ?? "").trim();
	const descEn = (values.description?.en ?? "").trim();
	const descriptionMismatch = Boolean(descDe) !== Boolean(descEn);
	const descriptionPairError = descriptionMismatch
		? "Bitte entweder beide Beschreibungen oder keine Beschreibung angeben"
		: undefined;

	function showError(
		touched: boolean | { de?: boolean; en?: boolean } | undefined,
		key?: "de" | "en",
	) {
		if (isSubmitted) return true;
		if (!touched) return false;
		if (typeof touched === "boolean") return touched;
		return key ? Boolean(touched[key]) : false;
	}

	function onSubmit(submitValues: NewSportsEvent) {
		setError(null);
		startTransition(async () => {
			try {
				const payload = {
					...submitValues,
					endTime: submitValues.endTime || null,
					invitationLink: submitValues.invitationLink || null,
					eMail: submitValues.eMail || null,
				};

				if (mode === "create") {
					await createSportFn({ data: payload });
				} else if (event) {
					await updateSportFn({ data: { ...payload, id: event.id } });
				}
				await router.invalidate();
				await router.navigate({ to: "/sports" });
			} catch (err) {
				setError(formatUserError(err, "Speichern fehlgeschlagen"));
			}
		});
	}

	function onInvalid() {
		setError("Bitte Pflichtfelder ausfüllen.");
	}

	function onDelete() {
		if (!event) return;
		if (!window.confirm("Sportveranstaltung wirklich löschen?")) return;
		setError(null);
		startTransition(async () => {
			try {
				await deleteSportFn({ data: { id: event.id } });
				await router.invalidate();
				await router.navigate({ to: "/sports" });
			} catch (err) {
				setError(formatUserError(err, "Löschen fehlgeschlagen"));
			}
		});
	}

	const selectClassName =
		"flex h-10 w-full border border-border/60 bg-card px-3 text-sm";

	return (
		<form
			onSubmit={form.handleSubmit(onSubmit, onInvalid)}
			className="flex max-w-3xl flex-col gap-6"
			noValidate
		>
			{error ? (
				<p className="error-banner" role="alert">
					{error}
				</p>
			) : null}

			<section className="grid gap-4 sm:grid-cols-2">
				<div className="space-y-2">
					<Label htmlFor="title-de">Titel (Deutsch) *</Label>
					<Input id="title-de" {...form.register("title.de")} />
					<FieldError
						show={showError(touchedFields.title, "de")}
						message={errors.title?.de?.message}
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor="title-en">Titel (Englisch) *</Label>
					<Input id="title-en" {...form.register("title.en")} />
					<FieldError
						show={showError(touchedFields.title, "en")}
						message={errors.title?.en?.message}
					/>
				</div>
			</section>

			<section className="grid gap-4 sm:grid-cols-3">
				<div className="space-y-2">
					<Label htmlFor="weekday">Wochentag *</Label>
					<select
						id="weekday"
						className={selectClassName}
						{...form.register("weekday")}
					>
						{Object.entries(weekdays).map(([key, value]) => (
							<option key={key} value={key}>
								{value.de}
							</option>
						))}
					</select>
				</div>
				<div className="space-y-2">
					<Label htmlFor="startTime">Startzeit *</Label>
					<Input id="startTime" type="time" {...form.register("startTime")} />
					<FieldError
						show={showError(touchedFields.startTime)}
						message={errors.startTime?.message}
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor="endTime">Endzeit</Label>
					<Input
						id="endTime"
						type="time"
						{...form.register("endTime", {
							setValueAs: (v) => (v === "" ? null : v),
						})}
					/>
					<FieldError
						show={showError(touchedFields.endTime)}
						message={errors.endTime?.message}
					/>
				</div>
			</section>

			<section className="grid gap-4 sm:grid-cols-3">
				<div className="space-y-2">
					<Label htmlFor="campus">Campus *</Label>
					<select
						id="campus"
						className={selectClassName}
						{...form.register("campus")}
					>
						<option value="Ingolstadt">Ingolstadt</option>
						<option value="Neuburg">Neuburg</option>
					</select>
				</div>
				<div className="space-y-2">
					<Label htmlFor="location">Ort *</Label>
					<Input id="location" {...form.register("location")} />
					<FieldError
						show={showError(touchedFields.location)}
						message={errors.location?.message}
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor="sportsCategory">Sportart *</Label>
					<select
						id="sportsCategory"
						className={selectClassName}
						{...form.register("sportsCategory")}
					>
						{sportsCategories.map((category) => (
							<option key={category.value} value={category.value}>
								{category.label}
							</option>
						))}
					</select>
					<FieldError
						show={showError(touchedFields.sportsCategory)}
						message={errors.sportsCategory?.message}
					/>
				</div>
			</section>

			<section className="grid gap-4 sm:grid-cols-2">
				<div className="space-y-2">
					<Label htmlFor="desc-de">Beschreibung (Deutsch)</Label>
					<textarea
						id="desc-de"
						rows={4}
						className="w-full border border-border/60 bg-card px-3 py-2 text-sm"
						{...form.register("description.de")}
					/>
					<FieldError
						show={
							Boolean(descriptionPairError) &&
							(showError(touchedFields.description, "de") ||
								showError(touchedFields.description, "en") ||
								isSubmitted)
						}
						message={descriptionPairError}
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor="desc-en">Beschreibung (Englisch)</Label>
					<textarea
						id="desc-en"
						rows={4}
						className="w-full border border-border/60 bg-card px-3 py-2 text-sm"
						{...form.register("description.en")}
					/>
				</div>
			</section>

			<section className="grid gap-4 sm:grid-cols-2">
				<div className="space-y-2">
					<Label htmlFor="email">E-Mail</Label>
					<Input
						id="email"
						type="email"
						{...form.register("eMail", {
							setValueAs: (v) => (v === "" ? null : v),
						})}
					/>
					<FieldError
						show={showError(touchedFields.eMail)}
						message={errors.eMail?.message}
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor="link">Einladungslink</Label>
					<Input
						id="link"
						{...form.register("invitationLink", {
							setValueAs: (v) => (v === "" ? null : v),
						})}
					/>
				</div>
			</section>

			<div className="flex items-center gap-3 border border-border/50 bg-card p-4 text-sm">
				<Checkbox
					id="requiresRegistration"
					checked={form.watch("requiresRegistration")}
					onCheckedChange={(checked) =>
						form.setValue("requiresRegistration", checked === true, {
							shouldValidate: true,
						})
					}
				/>
				<label htmlFor="requiresRegistration">Anmeldung erforderlich</label>
			</div>

			<div className="flex flex-wrap items-center gap-3">
				<Button type="submit" disabled={!canSubmit}>
					{pending ? "Speichern…" : "Speichern"}
				</Button>
				{mode === "edit" ? (
					<Button
						type="button"
						variant="destructive"
						disabled={pending}
						onClick={onDelete}
					>
						Löschen
					</Button>
				) : null}
			</div>
		</form>
	);
}
