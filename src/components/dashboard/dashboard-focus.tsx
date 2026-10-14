import { Link } from "@tanstack/react-router";
import {
	ArrowRight,
	DoorOpen,
	Dumbbell,
	type LucideIcon,
	Megaphone,
	Plus,
	School,
} from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import {
	announcementStatus,
	getAnnouncementStatusMeta,
} from "#/lib/announcement-status";
import { ROUTES } from "#/lib/constants";
import type { DashboardSummary } from "#/lib/dashboard.functions";
import { roomReasonLabel } from "#/lib/labels";
import { cn, formatTime, weekdays } from "#/lib/utils";

type ContentDomain = "sports" | "announcements" | "reports";

export function contentDomains(summary: DashboardSummary): ContentDomain[] {
	const domains: ContentDomain[] = [];
	if (summary.sports) domains.push("sports");
	if (summary.announcements) domains.push("announcements");
	if (summary.reports) domains.push("reports");
	return domains;
}

export function homeLeadFor(summary: DashboardSummary): string {
	const domains = contentDomains(summary);
	if (domains.length === 1) {
		switch (domains[0]) {
			case "sports":
				return "Du verwaltest den Hochschulsport für Neuland Next.";
			case "announcements":
				return "Du verwaltest Ankündigungen in der Neuland-App.";
			case "reports":
				return "Du bearbeitest Raummeldungen aus der Campus-App.";
		}
	}
	if (domains.length === 0) {
		return "Nutze die Navigation für deine Bereiche.";
	}
	return "Überblick über deine Bereiche in Neuland Next.";
}

export function DashboardFocus({ summary }: { summary: DashboardSummary }) {
	const domains = contentDomains(summary);
	if (domains.length !== 1) return null;

	switch (domains[0]) {
		case "sports":
			return summary.sports ? <SportsFocus sports={summary.sports} /> : null;
		case "announcements":
			return summary.announcements ? (
				<AnnouncementsFocus announcements={summary.announcements} />
			) : null;
		case "reports":
			return summary.reports ? (
				<ReportsFocus reports={summary.reports} />
			) : null;
	}
}

function SportsFocus({
	sports,
}: {
	sports: NonNullable<DashboardSummary["sports"]>;
}) {
	return (
		<div className="space-y-4 sm:space-y-5">
			<section className="grid gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(16rem,1fr)]">
				<FocusHero
					icon={Dumbbell}
					eyebrow="Hochschulsport"
					value={sports.total}
					unit="Sportangebote"
					description="Wöchentliche Angebote in der App — bearbeiten, anlegen, aktuell halten."
					actions={
						<>
							<Button asChild>
								<Link to={ROUTES.SPORTS}>
									Alle anzeigen
									<ArrowRight aria-hidden />
								</Link>
							</Button>
							<Button asChild variant="outline">
								<Link to={ROUTES.SPORTS_NEW}>
									<Plus aria-hidden />
									Neues Angebot
								</Link>
							</Button>
						</>
					}
				/>

				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
					<MetricPanel
						label="Campus Ingolstadt"
						value={sports.byCampus.Ingolstadt}
						icon={School}
					/>
					<MetricPanel
						label="Campus Neuburg"
						value={sports.byCampus.Neuburg}
						icon={School}
					/>
				</div>
			</section>

			<PreviewPanel
				title="Wochenplan"
				href={ROUTES.SPORTS}
				empty={sports.recent.length === 0}
				emptyLabel="Noch keine Sportangebote vorhanden."
			>
				{sports.recent.map((item) => (
					<li key={item.id}>
						<Link
							to="/sports/$id"
							params={{ id: item.id }}
							className="flex items-start justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
						>
							<div className="min-w-0 space-y-1">
								<p className="truncate text-sm font-medium">{item.title}</p>
								<p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
									<span>{weekdays[item.weekday].de}</span>
									<span aria-hidden>·</span>
									<span>
										{formatTime(item.startTime)}
										{item.endTime ? ` – ${formatTime(item.endTime)}` : ""}
									</span>
									<span aria-hidden>·</span>
									<span className="truncate">{item.location}</span>
								</p>
							</div>
							<Badge variant="outline" className="shrink-0">
								{item.campus}
							</Badge>
						</Link>
					</li>
				))}
			</PreviewPanel>
		</div>
	);
}

function AnnouncementsFocus({
	announcements,
}: {
	announcements: NonNullable<DashboardSummary["announcements"]>;
}) {
	return (
		<div className="space-y-4 sm:space-y-5">
			<section className="grid gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(16rem,1fr)]">
				<FocusHero
					icon={Megaphone}
					eyebrow="Ankündigungen"
					value={announcements.active}
					unit="aktive Ankündigungen"
					description={`${announcements.upcoming} anstehend — Inhalte für die App planen und freigeben.`}
					actions={
						<>
							<Button asChild>
								<Link to={ROUTES.ANNOUNCEMENTS}>
									Alle anzeigen
									<ArrowRight aria-hidden />
								</Link>
							</Button>
							<Button asChild variant="outline">
								<Link to={ROUTES.ANNOUNCEMENTS_NEW}>
									<Plus aria-hidden />
									Neue Ankündigung
								</Link>
							</Button>
						</>
					}
				/>

				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
					<MetricPanel
						label="Aktiv"
						value={announcements.active}
						icon={Megaphone}
					/>
					<MetricPanel
						label="Anstehend"
						value={announcements.upcoming}
						icon={Megaphone}
					/>
				</div>
			</section>

			<PreviewPanel
				title="Aktive & anstehende"
				href={ROUTES.ANNOUNCEMENTS}
				empty={announcements.recent.length === 0}
				emptyLabel="Keine aktiven oder anstehenden Ankündigungen."
			>
				{announcements.recent.map((item) => {
					const meta = getAnnouncementStatusMeta(item.status);
					const StatusIcon = meta.icon;
					return (
						<li key={item.id}>
							<Link
								to="/announcements/$id"
								params={{ id: item.id }}
								className="flex items-start justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
							>
								<p className="min-w-0 truncate text-sm font-medium">
									{item.title}
								</p>
								<span
									className={cn(
										"flex shrink-0 items-center gap-1 text-xs",
										meta.className,
									)}
								>
									<StatusIcon className="size-3" aria-hidden />
									{announcementStatus[item.status]}
								</span>
							</Link>
						</li>
					);
				})}
			</PreviewPanel>
		</div>
	);
}

function ReportsFocus({
	reports,
}: {
	reports: NonNullable<DashboardSummary["reports"]>;
}) {
	return (
		<div className="space-y-4 sm:space-y-5">
			<section className="grid gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(16rem,1fr)]">
				<FocusHero
					icon={DoorOpen}
					eyebrow="Raummeldungen"
					value={reports.open}
					unit="offene Meldungen"
					description="Rückmeldungen aus der Campus-App prüfen und erledigen."
					actions={
						<Button asChild>
							<Link to={ROUTES.ROOM_REPORTS}>
								Meldungen öffnen
								<ArrowRight aria-hidden />
							</Link>
						</Button>
					}
				/>

				<div className="grid gap-4">
					<MetricPanel
						label="In der Warteschlange"
						value={reports.open}
						icon={DoorOpen}
						hint="Noch zu erledigen"
					/>
				</div>
			</section>

			<PreviewPanel
				title="Offene Meldungen"
				href={ROUTES.ROOM_REPORTS}
				empty={reports.recentOpen.length === 0}
				emptyLabel="Keine offenen Raummeldungen."
			>
				{reports.recentOpen.map((item) => (
					<li key={item.id}>
						<Link
							to={ROUTES.ROOM_REPORTS}
							className="flex items-start justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
						>
							<div className="min-w-0 space-y-0.5">
								<p className="truncate text-sm font-medium">{item.room}</p>
								<p className="text-xs text-muted-foreground">
									{roomReasonLabel(item.reason)}
								</p>
							</div>
						</Link>
					</li>
				))}
			</PreviewPanel>
		</div>
	);
}

function FocusHero({
	icon: Icon,
	eyebrow,
	value,
	unit,
	description,
	actions,
}: {
	icon: LucideIcon;
	eyebrow: string;
	value: number;
	unit: string;
	description: string;
	actions: ReactNode;
}) {
	return (
		<div className="surface-panel flex min-h-64 flex-col justify-between gap-8 p-6 sm:min-h-72 sm:p-8">
			<div className="space-y-5">
				<div className="flex items-center gap-3">
					<span className="flex size-10 shrink-0 items-center justify-center border border-foreground/20 text-foreground">
						<Icon className="size-4" aria-hidden />
					</span>
					<span className="text-sm font-semibold text-muted-foreground">
						{eyebrow}
					</span>
				</div>
				<div className="space-y-2">
					<p className="text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl">
						{value}
					</p>
					<p className="text-sm font-medium text-foreground">{unit}</p>
					<p className="max-w-md text-sm text-muted-foreground">
						{description}
					</p>
				</div>
			</div>
			<div className="flex flex-wrap gap-3">{actions}</div>
		</div>
	);
}

function MetricPanel({
	label,
	value,
	icon: Icon,
	hint,
}: {
	label: string;
	value: number;
	icon: LucideIcon;
	hint?: string;
}) {
	return (
		<div className="surface-panel flex items-center gap-3 p-5">
			<span className="flex size-9 shrink-0 items-center justify-center border border-foreground/20 text-foreground">
				<Icon className="size-4" aria-hidden />
			</span>
			<div className="min-w-0 space-y-0.5">
				<p className="text-xs font-medium text-muted-foreground">{label}</p>
				<p className="text-2xl font-semibold tabular-nums tracking-tight">
					{value}
				</p>
				{hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
			</div>
		</div>
	);
}

function PreviewPanel({
	title,
	href,
	empty,
	emptyLabel,
	children,
}: {
	title: string;
	href: string;
	empty: boolean;
	emptyLabel: string;
	children: ReactNode;
}) {
	return (
		<section className="surface-panel flex flex-col overflow-hidden">
			<div className="flex items-center justify-between gap-2 border-b border-border/50 px-4 py-2.5">
				<h2 className="text-sm font-semibold">{title}</h2>
				<Link
					to={href}
					className="text-xs font-medium text-primary hover:underline"
				>
					Alle
				</Link>
			</div>
			{empty ? (
				<p className="px-4 py-8 text-sm text-muted-foreground">{emptyLabel}</p>
			) : (
				<ul className="divide-y divide-border/50">{children}</ul>
			)}
		</section>
	);
}

export function DashboardEmptyWorkspace() {
	return (
		<div className="surface-panel space-y-2 p-6 sm:p-8">
			<p className="text-sm font-medium text-foreground">Arbeitsbereich</p>
			<p className="max-w-lg text-sm text-muted-foreground">
				Inhalte für Sport, Ankündigungen oder Raummeldungen sind für dein Konto
				nicht freigeschaltet. Nutze die Navigation für verfügbare Bereiche.
			</p>
		</div>
	);
}
