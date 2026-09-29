import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "#/lib/utils";

const buttonVariants = cva(
	"inline-flex max-w-full min-w-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold tracking-tight transition-[color,background-color,border-color,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
	{
		variants: {
			variant: {
				default:
					"border border-primary/40 bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
				destructive:
					"border border-destructive/50 bg-destructive text-destructive-foreground hover:bg-destructive/90",
				outline:
					"border border-border/60 bg-card text-foreground hover:border-border hover:bg-muted/60",
				secondary:
					"border border-border/50 bg-secondary text-secondary-foreground hover:bg-muted",
				ghost: "text-foreground hover:bg-muted/60",
				link: "text-primary underline-offset-4 hover:underline",
			},
			size: {
				default: "h-10 px-4 py-2",
				sm: "h-9 px-3 text-xs",
				lg: "h-11 px-5",
				icon: "h-10 w-10",
				"icon-sm": "h-9 w-9 px-0",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, asChild = false, ...props }, ref) => {
		const Comp = asChild ? Slot : "button";
		return (
			<Comp
				className={cn(buttonVariants({ variant, size, className }))}
				ref={ref}
				{...props}
			/>
		);
	},
);
Button.displayName = "Button";

export { Button, buttonVariants };
