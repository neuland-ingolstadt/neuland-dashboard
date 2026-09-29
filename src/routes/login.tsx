import { createFileRoute, redirect } from "@tanstack/react-router";
import { NeulandPalm } from "#/components/brand/neuland-palm";
import { LegalFooter } from "#/components/layout/legal-footer";
import { PageShell } from "#/components/layout/page-shell";
import { Button } from "#/components/ui/button";
import { hasAppAccess } from "#/lib/auth";
import { getAuthStatusFn } from "#/lib/auth.functions";
import { APP_NAME, ROUTES } from "#/lib/constants";

const ERROR_MESSAGES: Record<string, string> = {
	oauth_session_missing:
		"Die Anmeldesitzung ist abgelaufen. Bitte erneut versuchen.",
	id_token_missing_sub:
		"Die Anmeldung war unvollständig. Bitte erneut versuchen.",
	login_failed: "Anmeldung fehlgeschlagen. Bitte erneut versuchen.",
};

export const Route = createFileRoute("/login")({
	validateSearch: (
		search: Record<string, unknown>,
	): { error?: string; mock?: boolean } => {
		const next: { error?: string; mock?: boolean } = {};
		if (typeof search.error === "string") next.error = search.error;
		if (search.mock === "1" || search.mock === true) next.mock = true;
		return next;
	},
	beforeLoad: async () => {
		const status = await getAuthStatusFn();
		if (status.user && hasAppAccess(status.user.capabilities)) {
			throw redirect({ to: "/" });
		}
		if (status.user && !hasAppAccess(status.user.capabilities)) {
			throw redirect({ to: "/no-access" });
		}
		return status;
	},
	component: LoginPage,
});

function LoginPage() {
	const { authMock, authConfigured } = Route.useRouteContext();
	const { error } = Route.useSearch();

	const errorMessage = error
		? (ERROR_MESSAGES[error] ?? "Ein unerwarteter Fehler ist aufgetreten.")
		: null;

	return (
		<PageShell>
			<div className="flex w-full min-w-0 flex-1 items-center justify-center p-4">
				<section className="panel w-full max-w-md">
					<div className="mb-5 flex justify-center">
						<NeulandPalm className="h-12 w-auto text-foreground" />
					</div>
					<p className="mb-2 text-center text-xs font-semibold tracking-wide text-muted-foreground uppercase">
						Neuland Next
					</p>
					<h1 className="text-center text-2xl font-semibold tracking-tight">
						{APP_NAME}
					</h1>
					<p className="mt-2 text-center text-sm text-muted-foreground">
						Melde dich mit deinem Neuland-Konto an, um fortzufahren.
					</p>

					{errorMessage ? (
						<p className="error-banner mt-4" role="alert">
							{errorMessage}
						</p>
					) : null}

					<div className="mt-6">
						{authConfigured ? (
							<Button asChild className="w-full" size="lg">
								<a href={ROUTES.AUTH_LOGIN}>Mit Authentik anmelden</a>
							</Button>
						) : (
							<p className="text-center text-sm text-muted-foreground">
								Authentik ist nicht konfiguriert. Nutze den Mock-Login für die
								lokale Entwicklung.
							</p>
						)}
					</div>

					{authMock ? (
						<div className="mock-block">
							<p className="mock-label">Mock-Rollen (Entwicklung)</p>
							<div className="mock-actions">
								<Button asChild variant="secondary" className="w-full">
									<a href="/api/auth/mock?role=admin">Admin</a>
								</Button>
								<Button asChild variant="outline" className="w-full">
									<a href="/api/auth/mock?role=sports">Sports</a>
								</Button>
								<Button asChild variant="outline" className="w-full">
									<a href="/api/auth/mock?role=announcements">Announcements</a>
								</Button>
								<Button asChild variant="outline" className="w-full">
									<a href="/api/auth/mock?role=reports">Reports</a>
								</Button>
								<Button asChild variant="ghost" className="w-full">
									<a href="/api/auth/mock?role=none">Ohne Zugang</a>
								</Button>
							</div>
						</div>
					) : null}
				</section>
			</div>
			<LegalFooter />
		</PageShell>
	);
}
