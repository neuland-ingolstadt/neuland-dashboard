import { createFileRoute, redirect } from "@tanstack/react-router";
import { NeulandPalm } from "#/components/brand/neuland-palm";
import { LegalFooter } from "#/components/layout/legal-footer";
import { PageShell } from "#/components/layout/page-shell";
import { Button } from "#/components/ui/button";
import { getAuthStatusFn } from "#/lib/auth.functions";
import { ROUTES } from "#/lib/constants";

export const Route = createFileRoute("/no-access")({
	beforeLoad: async () => {
		const status = await getAuthStatusFn();
		if (!status.user) {
			throw redirect({ to: "/login" });
		}
		return status;
	},
	component: NoAccessPage,
});

function NoAccessPage() {
	const { user } = Route.useRouteContext();
	const name = user?.name || "du";

	return (
		<PageShell>
			<div className="flex w-full min-w-0 flex-1 items-center justify-center p-4">
				<section className="panel w-full max-w-md">
					<div className="mb-5 flex justify-center">
						<NeulandPalm className="h-12 w-auto text-foreground" />
					</div>
					<p className="mb-2 text-center text-xs font-semibold tracking-wide text-muted-foreground uppercase">
						Kein Zugang
					</p>
					<h1 className="text-center text-2xl font-semibold tracking-tight">
						Kein Zugriff
					</h1>
					<p className="mt-2 text-center text-sm text-muted-foreground">
						Hallo {name}, dein Konto hat derzeit keinen Zugang zum Dashboard.
						Bitte wende dich an ein Vorstandsmitglied.
					</p>
					<div className="mt-6">
						<Button asChild variant="outline" className="w-full">
							<a href={ROUTES.AUTH_LOGOUT}>Abmelden</a>
						</Button>
					</div>
				</section>
			</div>
			<LegalFooter />
		</PageShell>
	);
}
