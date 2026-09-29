import { getRouteApi, Link, useRouterState } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
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
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "#/components/ui/sheet";
import { APP_NAME, ROUTES } from "#/lib/constants";
import { cn } from "#/lib/utils";

const appRouteApi = getRouteApi("/_app");

function MobileNavSection({
	title,
	items,
	pathname,
	onNavigate,
	hideTitle = false,
}: {
	title: string;
	items: NavItem[];
	pathname: string;
	onNavigate: () => void;
	hideTitle?: boolean;
}) {
	return (
		<div className="flex flex-col gap-1">
			{hideTitle ? (
				<span className="sr-only">{title}</span>
			) : (
				<p className="px-1 pb-1.5 text-[0.7rem] font-semibold text-muted-foreground">
					{title}
				</p>
			)}
			{items.map((item) => {
				const Icon = item.icon;
				const active = item.match(pathname);
				const className = cn(
					"relative flex items-center gap-3 border border-transparent px-3 py-3 text-sm no-underline transition-colors",
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
						<span className="min-w-0 flex-1 truncate">{item.label}</span>
					</>
				);

				if (item.external) {
					return (
						<a
							key={item.to}
							href={item.to}
							target="_blank"
							rel="noopener noreferrer"
							onClick={onNavigate}
							className={className}
						>
							{content}
						</a>
					);
				}

				return (
					<Link
						key={item.to}
						to={item.to}
						onClick={onNavigate}
						className={className}
						aria-current={active ? "page" : undefined}
					>
						{content}
					</Link>
				);
			})}
		</div>
	);
}

export function MobileNavSheet({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const { user } = appRouteApi.useRouteContext();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const features = navItemsForCapabilities(featureItems, user.capabilities);
	const bottom = navItemsForCapabilities(bottomNavItems, user.capabilities);
	const external = navItemsForCapabilities(
		externalAdminLinks,
		user.capabilities,
	);

	function close() {
		onOpenChange(false);
	}

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent
				side="bottom"
				showClose
				className="max-h-[85dvh] gap-0 overflow-hidden p-0 md:hidden"
			>
				<div aria-hidden className="mx-auto mt-3 h-1 w-10 shrink-0 bg-border" />
				<SheetHeader className="border-b border-border px-4 py-4 pr-12">
					<div className="flex items-center gap-3">
						<NeulandPalm className="h-7 w-auto shrink-0 text-foreground" />
						<div className="min-w-0">
							<SheetTitle>{APP_NAME}</SheetTitle>
							<SheetDescription className="sr-only">
								Navigation
							</SheetDescription>
						</div>
					</div>
				</SheetHeader>

				<nav
					className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-4"
					aria-label="Hauptnavigation"
				>
					<MobileNavSection
						title="Übersicht"
						items={overviewItems}
						pathname={pathname}
						onNavigate={close}
					/>
					{features.length > 0 ? (
						<MobileNavSection
							title="Verwaltung"
							items={features}
							pathname={pathname}
							onNavigate={close}
						/>
					) : null}
					{external.length > 0 ? (
						<MobileNavSection
							title="Extern"
							items={external}
							pathname={pathname}
							onNavigate={close}
						/>
					) : null}
					{bottom.length > 0 ? (
						<MobileNavSection
							title="Audit"
							items={bottom}
							pathname={pathname}
							onNavigate={close}
							hideTitle
						/>
					) : null}
				</nav>

				<div className="flex items-center justify-between border-t border-border p-4">
					<ThemeToggle variant="outline" size="icon-sm" />
					<a
						href={ROUTES.AUTH_LOGOUT}
						className="inline-flex h-9 items-center gap-2 px-3 text-sm text-muted-foreground no-underline hover:text-foreground"
					>
						<LogOut className="size-4" aria-hidden />
						Abmelden
					</a>
				</div>
			</SheetContent>
		</Sheet>
	);
}
