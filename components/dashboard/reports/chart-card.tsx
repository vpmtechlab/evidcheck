"use client";

import React from "react";

interface ChartCardProps {
	icon: React.ReactNode;
	iconTile: string;
	title: string;
	description?: string;
	aside?: React.ReactNode;
	children: React.ReactNode;
}

/** Consistent card shell for report charts. */
export function ChartCard({ icon, iconTile, title, description, aside, children }: ChartCardProps) {
	return (
		<div className="bg-white p-5 rounded-lg border border-gray-200 shadow-2xs space-y-5">
			<div className="flex items-center justify-between gap-3">
				<div className="flex items-center gap-2.5 min-w-0">
					<div className={`p-2 rounded-md shrink-0 ${iconTile}`}>
						{icon}
					</div>
					<div className="min-w-0">
						<h3 className="text-sm font-bold text-gray-900 tracking-tight truncate">
							{title}
						</h3>
						{description && (
							<p className="text-[11px] text-gray-500 mt-0.5 truncate">
								{description}
							</p>
						)}
					</div>
				</div>
				{aside && <div className="shrink-0">{aside}</div>}
			</div>
			{children}
		</div>
	);
}
