import { AlertTriangle, Megaphone } from "lucide-react";
import { useEffect, useState } from "react";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import type { NewAnnouncement } from "#/lib/schemas/announcements";

type AnnouncementPreviewCardProps = {
	formData: Partial<NewAnnouncement>;
	displayLanguage: "de" | "en";
};

export function AnnouncementPreviewCard({
	formData,
	displayLanguage,
}: AnnouncementPreviewCardProps) {
	const { title, description, imageUrl, url } = formData;
	const [imageError, setImageError] = useState(false);

	// biome-ignore lint/correctness/useExhaustiveDependencies: reset error when image URL changes
	useEffect(() => {
		setImageError(false);
	}, [imageUrl]);

	const currentTitle = title?.[displayLanguage] || "Titel Vorschau";
	const currentDescription =
		description?.[displayLanguage] || "Beschreibung Vorschau...";

	return (
		<Card className="w-full max-w-md">
			<CardHeader>
				<div className="flex items-center gap-3">
					<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
						<Megaphone size={20} />
					</div>
					<CardTitle className="flex-1 text-base font-semibold leading-tight">
						{currentTitle}
					</CardTitle>
				</div>
			</CardHeader>
			<CardContent className="-mt-2">
				<p className="text-sm text-muted-foreground">{currentDescription}</p>
				{imageUrl ? (
					<div className="mt-4 overflow-hidden rounded-md">
						{!imageError ? (
							<img
								key={imageUrl}
								src={imageUrl}
								className="h-[130px] w-full object-cover"
								onError={() => setImageError(true)}
								alt="Ankündigungsbild Vorschau"
							/>
						) : (
							<div className="flex h-[130px] w-full flex-col items-center justify-center gap-0.5 bg-muted/50 px-3 text-center text-red-600">
								<AlertTriangle className="mb-1 h-6 w-6" />
								<p className="text-xs">Bild konnte nicht geladen werden.</p>
								<p className="text-[10px] text-muted-foreground">
									{imageUrl.includes("assets.neuland.app")
										? "Alte assets.neuland.app-URL ist nicht öffentlich erreichbar. Bitte ein Bild aus der Bibliothek wählen."
										: "URL liefert keinen öffentlichen Zugriff (z. B. HTTP 403)."}
								</p>
							</div>
						)}
					</div>
				) : null}
				{url ? (
					<div className="mt-3 text-right">
						<a
							href={url}
							target="_blank"
							rel="noopener noreferrer"
							className="text-xs text-muted-foreground hover:underline"
						>
							Mehr lesen
						</a>
					</div>
				) : null}
			</CardContent>
		</Card>
	);
}
