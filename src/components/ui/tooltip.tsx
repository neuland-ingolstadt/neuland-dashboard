import {
	type ReactNode,
	useCallback,
	useEffect,
	useId,
	useRef,
	useState,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "#/lib/utils";

type TooltipSide = "top" | "bottom" | "left" | "right";

type TooltipProps = {
	label: string;
	side?: TooltipSide;
	/** When false, children render without a tooltip wrapper. */
	enabled?: boolean;
	className?: string;
	children: ReactNode;
};

const GAP = 10;

function positionFor(
	rect: DOMRect,
	side: TooltipSide,
): { top: number; left: number; transform: string } {
	switch (side) {
		case "bottom":
			return {
				top: rect.bottom + GAP,
				left: rect.left + rect.width / 2,
				transform: "translateX(-50%)",
			};
		case "left":
			return {
				top: rect.top + rect.height / 2,
				left: rect.left - GAP,
				transform: "translate(-100%, -50%)",
			};
		case "right":
			return {
				top: rect.top + rect.height / 2,
				left: rect.right + GAP,
				transform: "translateY(-50%)",
			};
		default:
			return {
				top: rect.top - GAP,
				left: rect.left + rect.width / 2,
				transform: "translate(-50%, -100%)",
			};
	}
}

export function Tooltip({
	label,
	side = "top",
	enabled = true,
	className,
	children,
}: TooltipProps) {
	const triggerRef = useRef<HTMLSpanElement>(null);
	const tooltipId = useId();
	const [open, setOpen] = useState(false);
	const [coords, setCoords] = useState<{
		top: number;
		left: number;
		transform: string;
	} | null>(null);

	const updatePosition = useCallback(() => {
		const el = triggerRef.current;
		if (!el) return;
		const target = (el.firstElementChild as HTMLElement | null) ?? el;
		setCoords(positionFor(target.getBoundingClientRect(), side));
	}, [side]);

	const show = useCallback(() => {
		if (!enabled) return;
		updatePosition();
		setOpen(true);
	}, [enabled, updatePosition]);

	const hide = useCallback(() => {
		setOpen(false);
	}, []);

	useEffect(() => {
		if (!open) return;
		const onScroll = () => updatePosition();
		window.addEventListener("scroll", onScroll, true);
		window.addEventListener("resize", onScroll);
		return () => {
			window.removeEventListener("scroll", onScroll, true);
			window.removeEventListener("resize", onScroll);
		};
	}, [open, updatePosition]);

	useEffect(() => {
		if (!enabled) setOpen(false);
	}, [enabled]);

	if (!enabled) {
		return children;
	}

	return (
		<>
			{/* biome-ignore lint/a11y/noStaticElementInteractions: tooltip trigger wraps interactive children */}
			<span
				ref={triggerRef}
				className={cn("inline-flex max-w-full", className)}
				onMouseEnter={show}
				onMouseLeave={hide}
				onFocus={show}
				onBlur={hide}
				aria-describedby={open ? tooltipId : undefined}
			>
				{children}
			</span>
			{open && coords
				? createPortal(
						<span
							id={tooltipId}
							role="tooltip"
							className="pointer-events-none fixed z-[100] whitespace-nowrap border border-border bg-card px-2.5 py-1.5 font-mono text-xs font-medium text-card-foreground shadow-sm"
							style={{
								top: coords.top,
								left: coords.left,
								transform: coords.transform,
							}}
						>
							{label}
						</span>,
						document.body,
					)
				: null}
		</>
	);
}
