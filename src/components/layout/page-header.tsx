import type { ReactNode } from "react";
import { cn } from "#/lib/utils";

type PageHeaderProps = {
	title: string;
	lead?: ReactNode;
	end?: ReactNode;
	className?: string;
};

export function PageHeader({ title, lead, end, className }: PageHeaderProps) {
	return (
		<header
			className={cn(
				"page-header flex flex-row items-start justify-between gap-3 sm:items-end",
				className,
			)}
		>
			<div className="min-w-0 flex-1 space-y-2">
				<h1 className="page-title text-balance">{title}</h1>
				{lead ? (
					typeof lead === "string" ? (
						<p className="page-lead max-w-2xl">{lead}</p>
					) : (
						<div className="page-lead max-w-2xl">{lead}</div>
					)
				) : null}
			</div>
			{end ? (
				<div className="flex shrink-0 flex-wrap items-center gap-3 sm:pb-1">
					{end}
				</div>
			) : null}
		</header>
	);
}
