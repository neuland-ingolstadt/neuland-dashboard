import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import type { ReactNode } from "react";
import {
	announcementStatus,
	getAnnouncementStatusMeta,
} from "#/lib/announcement-status";
import { ROUTES } from "#/lib/constants";
import type { DashboardSummary } from "#/lib/dashboard.functions";
import { formatEnumLabel, roomReasonLabel } from "#/lib/labels";
import { cn } from "#/lib/utils";

export function DashboardQueues({ summary }: { summary: DashboardSummary }) {
	const hasReports = summary.reports && summary.reports.recentOpen.length > 0;
	const hasAnnouncements =
		summary.announcements && summary.announcements.recent.length > 0;
	const hasAudit = summary.audit && summary.audit.recent.length > 0;

	if (!hasReports && !hasAnnouncements && !hasAudit) {
		const hasAnyDomain =
			summary.reports !== null ||
			summary.announcements !== null ||
			summary.sports !== null;
		if (!hasAnyDomain) return null;

		return (
			<section className="space-y-3">
				<h2 className="text-sm font-semibold text-muted-foreground">
					Aufmerksamkeit
				</h2>
				<p className="text-sm text-muted-foreground">
					Aktuell nichts Offenes in deinen Bereichen.
				</p>
			</section>
		);
	}

	return (
		<>
			{hasReports || hasAnnouncements ? (
				<section className="space-y-3">
					<h2 className="text-sm font-semibold text-muted-foreground">
						Aufmerksamkeit
					</h2>
					<div className="grid gap-3 lg:grid-cols-2">
						{summary.reports ? (
							<QueuePanel
								title="Offene Raummeldungen"
								href={ROUTES.ROOM_REPORTS}
								empty={summary.reports.recentOpen.length === 0}
								emptyLabel="Keine offenen Meldungen."
							>
								{summary.reports.recentOpen.map((item) => (
									<li key={item.id}>
										<Link
											to={ROUTES.ROOM_REPORTS}
											className="flex items-start justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
										>
											<div className="min-w-0 space-y-0.5">
												<p className="truncate text-sm font-medium">
													{item.room}
												</p>
												<p className="text-xs text-muted-foreground">
													{roomReasonLabel(item.reason)}
												</p>
											</div>
											<span className="shrink-0 text-xs text-muted-foreground">
												{format(new Date(item.createdAt), "dd.MM.yyyy")}
											</span>
										</Link>
									</li>
								))}
							</QueuePanel>
						) : null}

						{summary.announcements ? (
							<QueuePanel
								title="Aktive & anstehende Ankündigungen"
								href={ROUTES.ANNOUNCEMENTS}
								empty={summary.announcements.recent.length === 0}
								emptyLabel="Keine aktiven oder anstehenden Ankündigungen."
							>
								{summary.announcements.recent.map((item) => {
									const meta = getAnnouncementStatusMeta(item.status);
									const StatusIcon = meta.icon;
									return (
										<li key={item.id}>
											<Link
												to="/announcements/$id"
												params={{ id: item.id }}
												className="flex items-start justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
											>
												<div className="min-w-0 space-y-0.5">
													<p className="truncate text-sm font-medium">
														{item.title}
													</p>
													<p
														className={cn(
															"flex items-center gap-1 text-xs",
															meta.className,
														)}
													>
														<StatusIcon className="size-3" aria-hidden />
														{announcementStatus[item.status]}
													</p>
												</div>
											</Link>
										</li>
									);
								})}
							</QueuePanel>
						) : null}
					</div>
				</section>
			) : null}

			{summary.audit && summary.audit.recent.length > 0 ? (
				<section className="space-y-3">
					<div className="flex items-baseline justify-between gap-3">
						<h2 className="text-sm font-semibold text-muted-foreground">
							Letzte Änderungen
						</h2>
						<Link
							to={ROUTES.AUDIT_LOG}
							className="text-xs font-medium text-primary hover:underline"
						>
							Audit-Log
						</Link>
					</div>
					<ul className="surface-panel divide-y divide-border/50">
						{summary.audit.recent.map((item) => (
							<li key={item.id}>
								<Link
									to={ROUTES.AUDIT_LOG}
									className="flex items-start justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
								>
									<div className="min-w-0 space-y-0.5">
										<p className="truncate text-sm font-medium">{item.name}</p>
										<p className="text-xs text-muted-foreground">
											{formatEnumLabel(item.operation)} · {item.entity}
										</p>
									</div>
									<span className="shrink-0 text-xs text-muted-foreground">
										{format(new Date(item.createdAt), "dd.MM. HH:mm")}
									</span>
								</Link>
							</li>
						))}
					</ul>
				</section>
			) : null}
		</>
	);
}

function QueuePanel({
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
		<div className="surface-panel flex flex-col overflow-hidden">
			<div className="flex items-center justify-between gap-2 border-b border-border/50 px-4 py-2.5">
				<h3 className="text-sm font-semibold">{title}</h3>
				<Link
					to={href}
					className="text-xs font-medium text-primary hover:underline"
				>
					Alle
				</Link>
			</div>
			{empty ? (
				<p className="px-4 py-6 text-sm text-muted-foreground">{emptyLabel}</p>
			) : (
				<ul className="divide-y divide-border/50">{children}</ul>
			)}
		</div>
	);
}
