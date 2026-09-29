import { Loader2 } from "lucide-react";
import { cn } from "#/lib/utils";

type SpinnerProps = {
	label?: string;
	className?: string;
};

export function Spinner({ label = "Laden…", className }: SpinnerProps) {
	return (
		<output
			className={cn(
				"flex w-full flex-col items-center justify-center gap-3 p-8",
				className,
			)}
			aria-live="polite"
			aria-busy="true"
			aria-label={label}
		>
			<Loader2 className="size-8 animate-spin text-primary" aria-hidden />
			<p className="m-0 text-center text-sm text-muted-foreground">{label}</p>
		</output>
	);
}
