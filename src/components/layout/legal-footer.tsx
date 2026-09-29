import { BUILD_COMMIT } from "#/lib/build-info";
import { EXTERNAL_LINKS } from "#/lib/constants";
import { cn } from "#/lib/utils";

export function LegalFooter({ className }: { className?: string }) {
	return (
		<footer
			className={cn(
				"page-gutter w-full min-w-0 border-t border-border/60 py-6 text-center text-xs text-muted-foreground",
				className,
			)}
		>
			<nav className="flex flex-wrap items-center justify-center gap-4">
				<a
					href={EXTERNAL_LINKS.WEBSITE_IMPRESSUM}
					target="_blank"
					rel="noopener noreferrer"
					className="transition-colors hover:text-foreground"
				>
					Impressum
				</a>
				<span aria-hidden="true" className="text-border">
					|
				</span>
				<a
					href={EXTERNAL_LINKS.WEBSITE_DATENSCHUTZ}
					target="_blank"
					rel="noopener noreferrer"
					className="transition-colors hover:text-foreground"
				>
					Datenschutz
				</a>
			</nav>
			<p className="mt-3">
				Build:{" "}
				<span className="rounded border border-border/80 px-1.5 py-0.5 text-foreground/60">
					{BUILD_COMMIT}
				</span>
			</p>
			<p className="mt-2">© Neuland Ingolstadt e.V.</p>
		</footer>
	);
}
