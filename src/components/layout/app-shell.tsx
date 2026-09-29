import { Menu } from "lucide-react";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import { NeulandPalm } from "#/components/brand/neuland-palm";
import { AppSidebar } from "#/components/layout/app-sidebar";
import { LegalFooter } from "#/components/layout/legal-footer";
import { MobileNavSheet } from "#/components/layout/mobile-nav-sheet";
import { Button } from "#/components/ui/button";
import { APP_NAME } from "#/lib/constants";
import { readSidebarCollapsed, writeSidebarCollapsed } from "#/lib/sidebar";
import { cn } from "#/lib/utils";

export function AppShell({
	children,
	mainClassName,
}: {
	children: ReactNode;
	mainClassName?: string;
}) {
	const [mobileOpen, setMobileOpen] = useState(false);
	const [collapsed, setCollapsed] = useState(false);
	const [ready, setReady] = useState(false);

	useEffect(() => {
		setCollapsed(readSidebarCollapsed());
		setReady(true);
	}, []);

	function handleCollapsedChange(next: boolean) {
		setCollapsed(next);
		writeSidebarCollapsed(next);
	}

	const handleToggleSidebar = useCallback(() => {
		const isDesktop = window.matchMedia("(min-width: 768px)").matches;
		if (isDesktop) {
			setCollapsed((prev) => {
				const next = !prev;
				writeSidebarCollapsed(next);
				return next;
			});
			return;
		}
		setMobileOpen((prev) => !prev);
	}, []);

	useEffect(() => {
		function onKey(e: KeyboardEvent) {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
				e.preventDefault();
				handleToggleSidebar();
			}
		}
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [handleToggleSidebar]);

	return (
		<div className="relative flex min-h-screen w-full min-w-0 bg-background">
			<div
				data-app-sidebar-shell
				className={cn(
					"sticky top-0 hidden h-svh shrink-0 md:block",
					ready && "transition-[width] duration-200 ease-out",
					collapsed ? "w-[4.25rem]" : "w-[16.5rem]",
				)}
			>
				<AppSidebar
					collapsed={collapsed}
					onCollapsedChange={handleCollapsedChange}
					animateWidth={ready}
				/>
			</div>

			<MobileNavSheet open={mobileOpen} onOpenChange={setMobileOpen} />

			<div className="flex min-h-screen min-w-0 flex-1 flex-col">
				<header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-card px-4 md:hidden">
					<Button
						type="button"
						variant="outline"
						size="icon-sm"
						aria-label="Menü öffnen"
						aria-expanded={mobileOpen}
						aria-haspopup="dialog"
						onClick={() => setMobileOpen(true)}
					>
						<Menu aria-hidden />
					</Button>
					<NeulandPalm className="h-6 w-auto text-foreground" />
					<span className="text-sm font-semibold">{APP_NAME}</span>
				</header>

				<main
					className={cn(
						"page-gutter mx-auto w-full min-w-0 max-w-6xl flex-1 py-6 sm:py-8 md:p-8 md:pt-8",
						mainClassName,
					)}
				>
					{children}
				</main>

				<LegalFooter />
			</div>
		</div>
	);
}
