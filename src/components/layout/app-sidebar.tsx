import { getRouteApi, Link, useRouterState } from "@tanstack/react-router";
import { LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { NeulandPalm } from "#/components/brand/neuland-palm";
import {
	bottomNavItems,
	externalAdminLinks,
	featureItems,
	type NavItem,
	navItemsForCapabilities,
	overviewItems,
} from "#/components/layout/nav-items";
import { ThemeToggle } from "#/components/layout/theme-toggle";
import { Button } from "#/components/ui/button";
import { Tooltip } from "#/components/ui/tooltip";
import { APP_NAME, ROUTES } from "#/lib/constants";
import { cn } from "#/lib/utils";

const appRouteApi = getRouteApi("/_app");

function userInitials(name: string): string {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if (parts.length === 0) return "?";
	if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
	return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

type AppSidebarProps = {
	collapsed?: boolean;
	onCollapsedChange?: (collapsed: boolean) => void;
	animateWidth?: boolean;
};

function NavSection({
	title,
	items,
	pathname,
	collapsed,
	hideTitle = false,
}: {
	title: string;
	items: NavItem[];
	pathname: string;
	collapsed: boolean;
	hideTitle?: boolean;
}) {
	return (
		<div className="flex flex-col gap-1">
			{hideTitle || collapsed ? (
				<span className="sr-only">{title}</span>
			) : (
				<p
					data-sidebar-label
					className="px-2 pb-2 text-[0.7rem] font-semibold text-muted-foreground"
				>
					{title}
				</p>
			)}
			{items.map((item) => {
				const Icon = item.icon;
				const active = item.match(pathname);
				const className = cn(
					"relative flex w-full items-center border border-transparent text-sm no-underline transition-colors",
					collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5",
					active
						? "border-border bg-muted font-medium text-foreground"
						: "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
				);

				const content = (
					<>
						{active ? (
							<span
								aria-hidden
								className="absolute inset-y-0 left-0 w-0.5 bg-primary"
							/>
						) : null}
						<Icon className="size-4 shrink-0" aria-hidden />
						{collapsed ? null : (
							<span data-sidebar-label className="min-w-0 flex-1 truncate">
								{item.label}
							</span>
						)}
					</>
				);

				return (
					<Tooltip
						key={item.to}
						label={item.label}
						side="right"
						enabled={collapsed}
						className="w-full"
					>
						{item.external ? (
							<a
								href={item.to}
								target="_blank"
								rel="noopener noreferrer"
								className={className}
								aria-label={collapsed ? item.label : undefined}
							>
								{content}
							</a>
						) : (
							<Link
								to={item.to}
								className={className}
								aria-current={active ? "page" : undefined}
								aria-label={collapsed ? item.label : undefined}
							>
								{content}
							</Link>
						)}
					</Tooltip>
				);
			})}
		</div>
	);
}

export function AppSidebar({
	collapsed = false,
	onCollapsedChange,
	animateWidth = true,
}: AppSidebarProps) {
	const { user } = appRouteApi.useRouteContext();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const canCollapse = typeof onCollapsedChange === "function";
	const features = navItemsForCapabilities(featureItems, user.capabilities);
	const bottom = navItemsForCapabilities(bottomNavItems, user.capabilities);
	const external = navItemsForCapabilities(
		externalAdminLinks,
		user.capabilities,
	);

	return (
		<aside
			className={cn(
				"app-sidebar flex h-full shrink-0 flex-col overflow-hidden border-r border-border bg-card text-card-foreground",
				animateWidth && "transition-[width] duration-200 ease-out",
				collapsed ? "w-[4.25rem]" : "w-[16.5rem]",
			)}
			data-collapsed={collapsed || undefined}
		>
			<div
				className={cn(
					"flex items-center border-b border-border",
					collapsed ? "flex-col gap-2 px-2 py-3" : "gap-2 px-3 py-3",
				)}
			>
				<Tooltip label={APP_NAME} side="right" enabled={collapsed}>
					<Link
						to={ROUTES.HOME}
						data-sidebar-brand
						className={cn(
							"flex min-w-0 flex-1 items-center no-underline",
							collapsed ? "justify-center" : "gap-3 px-1",
						)}
						aria-label={collapsed ? APP_NAME : undefined}
					>
						<NeulandPalm className="h-7 w-auto shrink-0 text-foreground" />
						{collapsed ? null : (
							<div data-sidebar-label className="min-w-0 leading-tight">
								<span className="block truncate text-sm font-semibold">
									{APP_NAME}
								</span>
								<span className="block text-xs text-muted-foreground">
									Neuland Next
								</span>
							</div>
						)}
					</Link>
				</Tooltip>
				{canCollapse ? (
					<Tooltip
						label={collapsed ? "Sidebar öffnen" : "Sidebar schließen"}
						side="right"
						enabled
					>
						<Button
							type="button"
							variant="ghost"
							size="icon-sm"
							className="shrink-0 text-muted-foreground"
							aria-label={collapsed ? "Sidebar öffnen" : "Sidebar schließen"}
							aria-expanded={!collapsed}
							onClick={() => onCollapsedChange(!collapsed)}
						>
							{collapsed ? (
								<PanelLeftOpen aria-hidden />
							) : (
								<PanelLeftClose aria-hidden />
							)}
						</Button>
					</Tooltip>
				) : null}
			</div>

			<nav
				className={cn(
					"flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto",
					collapsed ? "p-2" : "p-3",
				)}
				aria-label="Hauptnavigation"
			>
				<NavSection
					title="Übersicht"
					items={overviewItems}
					pathname={pathname}
					collapsed={collapsed}
				/>
				{features.length > 0 ? (
					<NavSection
						title="Verwaltung"
						items={features}
						pathname={pathname}
						collapsed={collapsed}
					/>
				) : null}
				{external.length > 0 ? (
					<NavSection
						title="Extern"
						items={external}
						pathname={pathname}
						collapsed={collapsed}
					/>
				) : null}
				{bottom.length > 0 ? (
					<div className="mt-auto">
						<NavSection
							title="Audit"
							items={bottom}
							pathname={pathname}
							collapsed={collapsed}
							hideTitle
						/>
					</div>
				) : null}
			</nav>

			<div
				className={cn(
					"mt-auto border-t border-border",
					collapsed ? "flex flex-col items-center gap-1 p-2" : "space-y-2 p-3",
				)}
			>
				{collapsed ? (
					<Tooltip
						label={user.name || user.email}
						side="right"
						enabled
					>
						<span
							className="flex size-9 items-center justify-center bg-primary/10 text-xs font-semibold text-primary"
							aria-hidden
						>
							{userInitials(user.name || user.email)}
						</span>
					</Tooltip>
				) : (
					<div
						data-sidebar-label
						className="flex min-w-0 items-center gap-3 px-1"
					>
						<div className="flex size-9 shrink-0 items-center justify-center bg-primary/10 text-xs font-semibold text-primary">
							{userInitials(user.name || user.email)}
						</div>
						<div className="min-w-0 leading-tight">
							<p className="truncate text-sm font-semibold text-foreground">
								{user.name || user.email}
							</p>
							{user.name && user.email ? (
								<p className="truncate text-xs text-muted-foreground">
									{user.email}
								</p>
							) : null}
						</div>
					</div>
				)}
				<div
					className={cn(
						"flex items-center text-muted-foreground",
						collapsed ? "flex-col gap-0.5" : "gap-0.5",
					)}
				>
					<Tooltip label="Theme" side="right" enabled={collapsed}>
						<ThemeToggle
							variant="ghost"
							size="icon-sm"
							className="text-muted-foreground"
						/>
					</Tooltip>
					{collapsed ? null : (
						<a
							href={ROUTES.AUTH_LOGOUT}
							data-sidebar-label
							className="ml-auto inline-flex h-9 items-center gap-2 px-2.5 text-sm text-muted-foreground no-underline transition-colors hover:bg-muted hover:text-foreground"
						>
							<LogOut className="size-4 shrink-0" aria-hidden />
							Abmelden
						</a>
					)}
				</div>
				{collapsed ? (
					<Tooltip label="Abmelden" side="right" enabled>
						<a
							href={ROUTES.AUTH_LOGOUT}
							aria-label="Abmelden"
							className="inline-flex size-9 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
						>
							<LogOut className="size-4" aria-hidden />
						</a>
					</Tooltip>
				) : null}
			</div>
		</aside>
	);
}
