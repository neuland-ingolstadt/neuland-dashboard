import { Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import {
	externalAdminLinks,
	featureItems,
	type NavItem,
	navItemsForCapabilities,
} from "#/components/layout/nav-items";
import type { AppCapability } from "#/lib/auth";

export function DashboardNavLinks({
	capabilities,
}: {
	capabilities: AppCapability[];
}) {
	const features = navItemsForCapabilities(featureItems, capabilities);
	const extern = navItemsForCapabilities(externalAdminLinks, capabilities);

	if (features.length === 0 && extern.length === 0) {
		return (
			<p className="text-sm text-muted-foreground">
				Für dein Konto sind derzeit keine Funktionen freigeschaltet.
			</p>
		);
	}

	return (
		<>
			{features.length > 0 ? (
				<LinkSection title="Verwaltung" items={features} />
			) : null}
			{extern.length > 0 ? <LinkSection title="Extern" items={extern} /> : null}
		</>
	);
}

function LinkSection({ title, items }: { title: string; items: NavItem[] }) {
	return (
		<section className="space-y-3">
			<h2 className="text-sm font-semibold text-muted-foreground">{title}</h2>
			<div className="grid gap-3 sm:grid-cols-2">
				{items.map((item) => (
					<NavCardLink key={item.to} item={item} />
				))}
			</div>
		</section>
	);
}

function NavCardLink({ item }: { item: NavItem }) {
	const Icon = item.icon;
	const className =
		"surface-panel flex h-full items-center gap-3 p-4 transition-colors hover:bg-muted/40";

	const content = (
		<>
			<span className="flex size-9 shrink-0 items-center justify-center border border-primary/35 bg-primary/10 text-primary">
				<Icon className="size-4" aria-hidden />
			</span>
			<span className="min-w-0 flex-1 font-semibold">{item.label}</span>
			{item.external ? (
				<ExternalLink className="size-4 text-muted-foreground" aria-hidden />
			) : null}
		</>
	);

	if (item.external) {
		return (
			<a
				href={item.to}
				target="_blank"
				rel="noopener noreferrer"
				className={className}
			>
				{content}
			</a>
		);
	}

	return (
		<Link to={item.to} className={className}>
			{content}
		</Link>
	);
}
