import { Check, ImageIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "#/components/ui/dialog";
import { formatUserError } from "#/lib/format-user-error";
import { type ListedImage, listImagesFn } from "#/lib/images.functions";
import { cn } from "#/lib/utils";

type ImageSelectorProps = {
	onSelectImage: (image: ListedImage) => void;
	currentImageUrl?: string | null;
	triggerClassName?: string;
};

export function ImageSelector({
	onSelectImage,
	currentImageUrl = null,
	triggerClassName,
}: ImageSelectorProps) {
	const [open, setOpen] = useState(false);
	const [images, setImages] = useState<ListedImage[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [selected, setSelected] = useState<ListedImage | null>(null);

	useEffect(() => {
		if (!currentImageUrl) {
			setSelected(null);
			return;
		}
		setSelected((prev) =>
			prev?.url === currentImageUrl
				? prev
				: {
						name: currentImageUrl.split("/").pop() ?? "Bild",
						url: currentImageUrl,
					},
		);
	}, [currentImageUrl]);

	const fetchImages = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const result = await listImagesFn();
			setImages(result);
			if (currentImageUrl) {
				const match = result.find((image) => image.url === currentImageUrl);
				if (match) setSelected(match);
			}
		} catch (err) {
			setError(formatUserError(err, "Bilder konnten nicht geladen werden."));
		} finally {
			setLoading(false);
		}
	}, [currentImageUrl]);

	useEffect(() => {
		if (open) void fetchImages();
	}, [open, fetchImages]);

	function confirmSelection() {
		if (!selected) return;
		onSelectImage(selected);
		setOpen(false);
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					type="button"
					variant="outline"
					className={cn(triggerClassName)}
				>
					<ImageIcon aria-hidden />
					Bild auswählen
				</Button>
			</DialogTrigger>
			<DialogContent className="flex h-[min(80vh,32rem)] w-[calc(100%-2rem)] max-w-3xl flex-col gap-0 p-0">
				<DialogHeader>
					<DialogTitle>Bild auswählen</DialogTitle>
					<DialogDescription>
						Wählen Sie ein Bild aus Ihren hochgeladenen Dateien.
					</DialogDescription>
				</DialogHeader>

				<div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
					{loading ? (
						<p className="flex h-full items-center justify-center text-sm text-muted-foreground">
							Bilder werden geladen…
						</p>
					) : error ? (
						<div className="flex h-full flex-col items-center justify-center gap-3 text-center">
							<p className="text-sm text-destructive">{error}</p>
							<Button
								type="button"
								variant="outline"
								onClick={() => void fetchImages()}
							>
								Erneut versuchen
							</Button>
						</div>
					) : images.length === 0 ? (
						<p className="flex h-full items-center justify-center text-sm text-muted-foreground">
							Keine Bilder gefunden. Laden Sie zuerst ein Bild hoch.
						</p>
					) : (
						<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
							{images.map((image) => {
								const isSelected = selected?.url === image.url;
								return (
									<button
										key={image.url}
										type="button"
										aria-pressed={isSelected}
										onClick={() => setSelected(image)}
										className={cn(
											"relative overflow-hidden border text-left transition-colors",
											isSelected
												? "border-primary ring-2 ring-ring/40"
												: "border-border/60 hover:border-border",
										)}
									>
										<img
											src={image.url}
											alt={image.name}
											className="aspect-video w-full object-cover"
										/>
										<p className="truncate px-2 py-1.5 text-xs text-muted-foreground">
											{image.name}
										</p>
										{isSelected ? (
											<span className="absolute top-1.5 right-1.5 inline-flex size-6 items-center justify-center bg-primary text-primary-foreground">
												<Check className="size-3.5" aria-hidden />
											</span>
										) : null}
									</button>
								);
							})}
						</div>
					)}
				</div>

				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => setOpen(false)}
					>
						Abbrechen
					</Button>
					<Button type="button" onClick={confirmSelection} disabled={!selected}>
						Auswahl bestätigen
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
