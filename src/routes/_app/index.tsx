import { createFileRoute, Link } from "@tanstack/react-router";
import {
	Activity,
	BarChart3,
	CalendarDays,
	DoorOpen,
	Dumbbell,
	ExternalLink,
	type LucideIcon,
	Megaphone,
	ScrollText,
} from "lucide-react";
import { PageHeader } from "#/components/layout/page-header";
import {
	type AppCapability,
	canAccessAnnouncements,
	canAccessAudit,
	canAccessOps,
	canAccessReports,
	canAccessSports,
} from "#/lib/auth";
import { EXTERNAL_LINKS, ROUTES } from "#/lib/constants";

type HomeCard = {
	title: string;
	description: string;
	href: string;
	icon: LucideIcon;
	visible: (capabilities: AppCapability[]) => boolean;
	external?: boolean;
};

const featureCards: HomeCard[] = [
	{
		title: "Hochschulsport",
		description: "Hochschulsportangebote und -kurse verwalten.",
		href: ROUTES.SPORTS,
		icon: Dumbbell,
		visible: canAccessSports,
	},
	{
		title: "Ankündigungen",
		description: "In-App Ankündigungen und Neuigkeiten.",
		href: ROUTES.ANNOUNCEMENTS,
		icon: Megaphone,
		visible: canAccessAnnouncements,
	},
	{
		title: "Campus Life Events",
		description: "Campus Life Veranstaltungen verwalten.",
		href: EXTERNAL_LINKS.CAMPUS_LIFE,
		icon: CalendarDays,
		visible: canAccessAnnouncements,
		external: true,
	},
	{
		title: "Raummeldungen",
		description: "Meldungen für falsch eingetragene Rauminfos.",
		href: ROUTES.ROOM_REPORTS,
		icon: DoorOpen,
		visible: canAccessReports,
	},
	{
		title: "Audit-Log",
		description: "Protokoll aller Änderungen.",
		href: ROUTES.AUDIT_LOG,
		icon: ScrollText,
		visible: canAccessAudit,
	},
];

const linkCards: HomeCard[] = [
	{
		title: "Analytics",
		description: "Analytics und Statistiken der Neuland Next App.",
		href: EXTERNAL_LINKS.ANALYTICS,
		icon: BarChart3,
		visible: canAccessOps,
		external: true,
	},
	{
		title: "Status",
		description: "Statusseite aller Neuland Next Services.",
		href: EXTERNAL_LINKS.STATUS,
		icon: Activity,
		visible: canAccessOps,
		external: true,
	},
];

export const Route = createFileRoute("/_app/")({
	component: HomePage,
});

function HomePage() {
	const { user } = Route.useRouteContext();
	const visibleFeatures = featureCards.filter((card) =>
		card.visible(user.capabilities),
	);
	const visibleLinks = linkCards.filter((card) =>
		card.visible(user.capabilities),
	);

	return (
		<>
			<PageHeader
				title={`Hallo ${user.name}`}
				lead="Willkommen im Neuland Dashboard."
			/>

			{visibleFeatures.length > 0 ? (
				<section className="space-y-3">
					<h2 className="text-sm font-semibold text-muted-foreground">
						Funktionen
					</h2>
					<div className="grid gap-3 sm:grid-cols-2">
						{visibleFeatures.map((card) => (
							<HomeCardLink key={card.href} card={card} />
						))}
					</div>
				</section>
			) : (
				<p className="text-sm text-muted-foreground">
					Für dein Konto sind derzeit keine Funktionen freigeschaltet.
				</p>
			)}

			{visibleLinks.length > 0 ? (
				<section className="space-y-3">
					<h2 className="text-sm font-semibold text-muted-foreground">Links</h2>
					<div className="grid gap-3 sm:grid-cols-2">
						{visibleLinks.map((card) => (
							<HomeCardLink key={card.href} card={card} />
						))}
					</div>
				</section>
			) : null}
		</>
	);
}

function HomeCardLink({ card }: { card: HomeCard }) {
	const Icon = card.icon;
	const className =
		"surface-panel flex h-full flex-col gap-2 p-4 transition-colors hover:bg-muted/40";

	const content = (
		<>
			<div className="flex items-center gap-2">
				<Icon className="size-5 shrink-0" aria-hidden />
				<span className="flex-1 font-semibold">{card.title}</span>
				{card.external ? (
					<ExternalLink className="size-4 text-muted-foreground" aria-hidden />
				) : null}
			</div>
			<p className="text-sm text-muted-foreground">{card.description}</p>
		</>
	);

	if (card.external) {
		return (
			<a
				href={card.href}
				target="_blank"
				rel="noopener noreferrer"
				className={className}
			>
				{content}
			</a>
		);
	}

	return (
		<Link to={card.href} className={className}>
			{content}
		</Link>
	);
}
