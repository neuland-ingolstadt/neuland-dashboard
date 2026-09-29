import { NeulandPalm } from "#/components/brand/neuland-palm";

export function DashboardPlaceholder() {
	return (
		<section className="flex min-h-[min(32rem,55vh)] flex-1 flex-col justify-center pt-4 pb-14 sm:pt-6 sm:pb-20">
			<div className="flex flex-col items-start gap-8 sm:flex-row sm:items-center sm:gap-10">
				<NeulandPalm
					aria-hidden
					className="size-24 shrink-0 text-foreground/15 sm:size-28"
				/>
				<div className="min-w-0 max-w-2xl space-y-5">
					<p className="text-sm font-semibold tracking-wide text-primary">
						Neuland Next
					</p>
					<h2 className="text-balance text-[clamp(1.85rem,4vw,2.75rem)] font-semibold leading-[1.15] tracking-tight text-foreground">
						Zentrales Admin-Dashboard
					</h2>
					<p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
						Zentrale Verwaltung von Inhalten und Abläufen der
						Neuland-Next-Plattform.
					</p>
				</div>
			</div>
		</section>
	);
}
