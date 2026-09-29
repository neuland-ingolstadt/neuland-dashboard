import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "@tanstack/react-router";
import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { AnnouncementPreviewCard } from "#/components/announcements/announcement-preview-card";
import { ImageSelector } from "#/components/announcements/image-selector";
import { Button } from "#/components/ui/button";
import { Checkbox } from "#/components/ui/checkbox";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#/components/ui/tabs";
import {
	createAnnouncementFn,
	deleteAnnouncementFn,
	updateAnnouncementFn,
} from "#/lib/announcements.functions";
import { formatUserError } from "#/lib/format-user-error";
import { uploadImageFn } from "#/lib/images.functions";
import { PLATFORM_OPTIONS, USER_KIND_OPTIONS } from "#/lib/labels";
import {
	type Announcement,
	type NewAnnouncement,
	newAnnouncementSchema,
} from "#/lib/schemas/announcements";

const PLATFORMS = PLATFORM_OPTIONS;
const USER_KINDS = USER_KIND_OPTIONS;

function toDatetimeLocalValue(value: Date | string | undefined): string {
	if (!value) return "";
	const date = value instanceof Date ? value : new Date(value);
	if (Number.isNaN(date.getTime())) return "";
	const pad = (n: number) => String(n).padStart(2, "0");
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

type AnnouncementFormProps = {
	mode: "create" | "edit";
	announcement?: Announcement;
};

export function AnnouncementForm({
	mode,
	announcement,
}: AnnouncementFormProps) {
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);
	const [uploadPending, setUploadPending] = useState(false);
	const [pending, startTransition] = useTransition();

	const form = useForm<NewAnnouncement>({
		resolver: zodResolver(newAnnouncementSchema),
		mode: "onTouched",
		reValidateMode: "onChange",
		defaultValues: {
			title: {
				de: announcement?.title.de ?? "",
				en: announcement?.title.en ?? "",
			},
			description: {
				de: announcement?.description.de ?? "",
				en: announcement?.description.en ?? "",
			},
			startDateTime: announcement?.startDateTime
				? new Date(announcement.startDateTime)
				: new Date(),
			endDateTime: announcement?.endDateTime
				? new Date(announcement.endDateTime)
				: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
			priority: announcement?.priority ?? 0,
			url: announcement?.url ?? null,
			platform: announcement?.platform ?? ["ANDROID", "IOS", "WEB", "WEB_DEV"],
			userKind: announcement?.userKind ?? ["STUDENT", "EMPLOYEE", "GUEST"],
			imageUrl: announcement?.imageUrl ?? null,
		},
	});

	const values = form.watch();
	const schemaValid = useMemo(
		() => newAnnouncementSchema.safeParse(values).success,
		[values],
	);
	const canSubmit = schemaValid && !pending && !uploadPending;
	const { errors, touchedFields, isSubmitted } = form.formState;

	function showError(
		touched: boolean | undefined | readonly (boolean | undefined)[],
	) {
		if (isSubmitted) return true;
		if (Array.isArray(touched)) return touched.some(Boolean);
		return Boolean(touched);
	}

	const [title, description, imageUrl, url] = form.watch([
		"title",
		"description",
		"imageUrl",
		"url",
	]);

	function toggleArrayValue<T extends string>(
		field: "platform" | "userKind",
		value: T,
		checked: boolean,
	) {
		const current = form.getValues(field) as T[];
		const next = checked
			? [...new Set([...current, value])]
			: current.filter((item) => item !== value);
		form.setValue(field, next as never, { shouldValidate: true });
	}

	async function onUpload(file: File | null) {
		if (!file) return;
		setUploadPending(true);
		setError(null);
		try {
			const formData = new FormData();
			formData.append("image", file);
			const result = await uploadImageFn({ data: formData });
			form.setValue("imageUrl", result.imageUrl, { shouldValidate: true });
		} catch (err) {
			setError(formatUserError(err, "Bild-Upload fehlgeschlagen"));
		} finally {
			setUploadPending(false);
		}
	}

	function onSubmit(values: NewAnnouncement) {
		setError(null);
		startTransition(async () => {
			try {
				const payload = {
					...values,
					url: values.url || null,
					imageUrl: values.imageUrl || null,
					startDateTime: new Date(values.startDateTime),
					endDateTime: new Date(values.endDateTime),
				};

				if (mode === "create") {
					await createAnnouncementFn({ data: payload });
				} else if (announcement) {
					await updateAnnouncementFn({
						data: { ...payload, id: announcement.id },
					});
				}
				await router.invalidate();
				await router.navigate({ to: "/announcements" });
			} catch (err) {
				setError(formatUserError(err, "Speichern fehlgeschlagen"));
			}
		});
	}

	function onInvalid() {
		setError("Bitte Pflichtfelder ausfüllen.");
	}

	function onDelete() {
		if (!announcement) return;
		if (!window.confirm("Ankündigung wirklich löschen?")) return;
		setError(null);
		startTransition(async () => {
			try {
				await deleteAnnouncementFn({ data: { id: announcement.id } });
				await router.invalidate();
				await router.navigate({ to: "/announcements" });
			} catch (err) {
				setError(formatUserError(err, "Löschen fehlgeschlagen"));
			}
		});
	}

	return (
		<div className="grid gap-8 lg:grid-cols-3">
			<form
				onSubmit={form.handleSubmit(onSubmit, onInvalid)}
				className="flex flex-col gap-6 lg:col-span-2"
				noValidate
			>
				{error ? (
					<p className="error-banner" role="alert">
						{error}
					</p>
				) : null}

				<section className="grid gap-4 sm:grid-cols-2">
					<div className="space-y-2">
						<Label htmlFor="start">Startzeit *</Label>
						<Input
							id="start"
							type="datetime-local"
							value={toDatetimeLocalValue(form.watch("startDateTime"))}
							onChange={(e) =>
								form.setValue("startDateTime", new Date(e.target.value), {
									shouldValidate: true,
								})
							}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="end">Endzeit *</Label>
						<Input
							id="end"
							type="datetime-local"
							value={toDatetimeLocalValue(form.watch("endDateTime"))}
							onChange={(e) =>
								form.setValue("endDateTime", new Date(e.target.value), {
									shouldValidate: true,
								})
							}
						/>
						{showError(touchedFields.endDateTime) && errors.endDateTime ? (
							<p className="text-sm text-destructive">
								{errors.endDateTime.message}
							</p>
						) : null}
					</div>
				</section>

				<section className="grid gap-4 sm:grid-cols-2">
					<div className="space-y-2">
						<Label htmlFor="title-de">Titel (Deutsch) *</Label>
						<Input id="title-de" {...form.register("title.de")} />
					</div>
					<div className="space-y-2">
						<Label htmlFor="title-en">Titel (Englisch) *</Label>
						<Input id="title-en" {...form.register("title.en")} />
					</div>
				</section>

				<section className="grid gap-4 sm:grid-cols-2">
					<div className="space-y-2">
						<Label htmlFor="desc-de">Beschreibung (Deutsch) *</Label>
						<textarea
							id="desc-de"
							rows={4}
							className="w-full border border-border bg-background px-3 py-2 text-sm"
							{...form.register("description.de")}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="desc-en">Beschreibung (Englisch) *</Label>
						<textarea
							id="desc-en"
							rows={4}
							className="w-full border border-border bg-background px-3 py-2 text-sm"
							{...form.register("description.en")}
						/>
					</div>
				</section>

				<section className="grid gap-4 sm:grid-cols-2">
					<div className="space-y-2">
						<Label htmlFor="priority">Priorität</Label>
						<Input
							id="priority"
							type="number"
							{...form.register("priority", { valueAsNumber: true })}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="url">URL</Label>
						<Input
							id="url"
							{...form.register("url", {
								setValueAs: (v) => (v === "" ? null : v),
							})}
						/>
					</div>
				</section>

				<section className="space-y-3">
					<Label>Plattformen *</Label>
					<div className="flex flex-wrap gap-4">
						{PLATFORMS.map((platform) => (
							<div
								key={platform.value}
								className="flex items-center gap-2 text-sm"
							>
								<Checkbox
									id={`platform-${platform.value}`}
									checked={form.watch("platform").includes(platform.value)}
									onCheckedChange={(checked) =>
										toggleArrayValue(
											"platform",
											platform.value,
											checked === true,
										)
									}
								/>
								<label htmlFor={`platform-${platform.value}`}>
									{platform.label}
								</label>
							</div>
						))}
					</div>
					{showError(touchedFields.platform) && errors.platform ? (
						<p className="text-sm text-destructive">
							{errors.platform.message}
						</p>
					) : null}
				</section>

				<section className="space-y-3">
					<Label>Benutzergruppen *</Label>
					<div className="flex flex-wrap gap-4">
						{USER_KINDS.map((kind) => (
							<div key={kind.value} className="flex items-center gap-2 text-sm">
								<Checkbox
									id={`userKind-${kind.value}`}
									checked={form.watch("userKind").includes(kind.value)}
									onCheckedChange={(checked) =>
										toggleArrayValue("userKind", kind.value, checked === true)
									}
								/>
								<label htmlFor={`userKind-${kind.value}`}>{kind.label}</label>
							</div>
						))}
					</div>
					{showError(touchedFields.userKind) && errors.userKind ? (
						<p className="text-sm text-destructive">
							{errors.userKind.message}
						</p>
					) : null}
				</section>

				<section className="space-y-3">
					<Label>Bild</Label>
					<div className="flex flex-wrap items-center gap-3">
						<ImageSelector
							currentImageUrl={imageUrl}
							onSelectImage={(image) => {
								form.setValue("imageUrl", image.url, { shouldValidate: true });
							}}
						/>
						<div className="flex items-center gap-2">
							<Input
								id="imageFile"
								type="file"
								accept="image/*"
								disabled={uploadPending}
								className="max-w-xs"
								onChange={(e) => onUpload(e.target.files?.[0] ?? null)}
							/>
							{uploadPending ? (
								<p className="text-xs text-muted-foreground">Upload läuft…</p>
							) : null}
						</div>
						{imageUrl ? (
							<Button
								type="button"
								variant="ghost"
								onClick={() =>
									form.setValue("imageUrl", null, { shouldValidate: true })
								}
							>
								Bild entfernen
							</Button>
						) : null}
					</div>
				</section>

				<div className="flex flex-wrap gap-3">
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

			<aside className="md:mt-[calc(2rem+24px)]">
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
							formData={{ title, description, imageUrl, url }}
							displayLanguage="de"
						/>
					</TabsContent>

					<TabsContent value="en">
						<AnnouncementPreviewCard
							formData={{ title, description, imageUrl, url }}
							displayLanguage="en"
						/>
					</TabsContent>
				</Tabs>
			</aside>
		</div>
	);
}
