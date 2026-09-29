import type { ReactNode } from "react";
import { cn } from "#/lib/utils";

export function PageShell({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"relative flex min-h-screen w-full min-w-0 flex-col bg-background",
				className,
			)}
		>
			{children}
		</div>
	);
}
