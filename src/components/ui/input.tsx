import * as React from "react";
import { cn } from "#/lib/utils";

const PICKER_TYPES = new Set([
	"date",
	"datetime-local",
	"month",
	"time",
	"week",
]);

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
	({ className, type = "text", ...props }, ref) => {
		const isPicker = PICKER_TYPES.has(type);
		const isFile = type === "file";

		return (
			<input
				type={type}
				className={cn(
					"flex h-10 w-full min-w-0 border border-border/60 bg-card px-3 py-2 font-sans text-sm text-foreground transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50",
					isPicker && "native-picker",
					isFile &&
						"cursor-pointer file:mr-3 file:cursor-pointer file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-foreground hover:file:bg-accent",
					className,
				)}
				ref={ref}
				{...props}
			/>
		);
	},
);
Input.displayName = "Input";

export { Input };
