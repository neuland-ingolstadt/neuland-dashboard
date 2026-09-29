import { Link } from "@tanstack/react-router";
import { DoorOpen, Dumbbell, type LucideIcon, Megaphone } from "lucide-react";
import { Badge } from "#/components/ui/badge";
import { ROUTES } from "#/lib/constants";
import type { DashboardSummary } from "#/lib/dashboard.functions";

type StatTile = {
	key: string;
	label: string;
	value: number;
	hint: string;
	href: string;
	icon: LucideIcon;
};

export function DashboardStats({ summary }: { summary: DashboardSummary }) {
	const tiles: StatTile[] = [];

	if (summary.reports) {
		tiles.push({
			key: "reports",
			label: "Offene Raummeldungen",
			value: summary.reports.open,
			hint: "Noch zu erledigen",
			href: ROUTES.ROOM_REPORTS,
			icon: DoorOpen,
		});
	}

	if (summary.announcements) {
		tiles.push({
			key: "announcements-active",
			label: "Aktive Ankündigungen",
			value: summary.announcements.active,
			hint: `${summary.announcements.upcoming} anstehend`,
			href: ROUTES.ANNOUNCEMENTS,
			icon: Megaphone,
		});
	}

	if (summary.sports) {
		tiles.push({
			key: "sports",
			label: "Sportangebote",
			value: summary.sports.total,
			hint: "Gesamt",
			href: ROUTES.SPORTS,
			icon: Dumbbell,
		});
	}

	if (tiles.length === 0) return null;

	return (
		<section className="space-y-3">
			<h2 className="text-sm font-semibold text-muted-foreground">Überblick</h2>
			<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
				{tiles.map((tile) => {
					const Icon = tile.icon;
					return (
						<Link
							key={tile.key}
							to={tile.href}
							className="surface-panel flex items-center gap-3 p-4 transition-colors hover:bg-muted/40"
						>
							<span className="flex size-9 shrink-0 items-center justify-center border border-foreground/20 text-foreground">
								<Icon className="size-4" aria-hidden />
							</span>
							<div className="min-w-0 flex-1 space-y-1">
								<div className="flex items-center justify-between gap-2">
									<span className="text-sm font-medium text-muted-foreground">
										{tile.label}
									</span>
									<Badge variant="outline">{tile.value}</Badge>
								</div>
								<p className="text-xs text-muted-foreground">{tile.hint}</p>
							</div>
						</Link>
					);
				})}
			</div>
		</section>
	);
}
