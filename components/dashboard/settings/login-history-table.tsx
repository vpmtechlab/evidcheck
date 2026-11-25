"use client";

import { Smartphone, Globe, Loader2 } from "lucide-react";
import { format } from "date-fns";

export interface LoginHistoryEntry {
	_id: string;
	createdAt: number;
	metadata?: Record<string, unknown>;
}

function parseUserAgent(ua?: string): string {
	if (!ua) return "Unknown Device";
	const agent = ua.toLowerCase();
	if (agent.includes("iphone")) return "iPhone";
	if (agent.includes("ipad")) return "iPad";
	if (agent.includes("android")) return "Android Device";
	if (agent.includes("macintosh")) return "MacBook Pro";
	if (agent.includes("windows")) return "Windows PC";
	if (agent.includes("linux")) return "Linux PC";
	return "Web Browser";
}

function deviceIcon(device: string) {
	return device.includes("iPhone") || device.includes("Android") ? (
		<Smartphone size={16} className="text-gray-400 shrink-0" />
	) : (
		<Globe size={16} className="text-gray-400 shrink-0" />
	);
}

export function LoginHistoryTable({ logs }: { logs: LoginHistoryEntry[] | undefined }) {
	return (
		<div>
			<h3 className="text-lg font-bold text-gray-900 mb-4">
				Recent Login Activity
			</h3>
			<div className="border border-gray-200 rounded-xl overflow-hidden overflow-x-auto">
				<table className="w-full text-sm text-left">
					<thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
						<tr>
							<th className="px-4 py-3">Device</th>
							<th className="px-4 py-3">Location</th>
							<th className="px-4 py-3">Date</th>
							<th className="px-4 py-3">Status</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-100">
						{logs === undefined ? (
							<tr>
								<td colSpan={4} className="px-4 py-8 text-center text-gray-500">
									<Loader2 className="animate-spin size-4 mx-auto mb-2" />
									Loading activity...
								</td>
							</tr>
						) : logs.length === 0 ? (
							<tr>
								<td colSpan={4} className="px-4 py-8 text-center text-gray-500">
									No recent login activity found.
								</td>
							</tr>
						) : (
							logs.map((log, index) => {
								const device = parseUserAgent(log.metadata?.userAgent as string);
								const location = (log.metadata?.location as string) || "Unknown";
								const isCurrent = index === 0;
								return (
									<tr key={log._id} className="hover:bg-gray-50/50">
										<td className="px-4 py-3 font-medium text-gray-900 flex items-center gap-2">
											{deviceIcon(device)}
											<span className="truncate">{device}</span>
										</td>
										<td className="px-4 py-3 text-gray-600 whitespace-nowrap">
											{location}
										</td>
										<td className="px-4 py-3 text-gray-500 whitespace-nowrap">
											{format(log.createdAt, "MMM d, h:mm a")}
										</td>
										<td className="px-4 py-3 whitespace-nowrap">
											<span
												className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
													isCurrent
														? "bg-green-50 text-green-700"
														: "bg-gray-100 text-gray-600"
												}`}
											>
												{isCurrent ? "Active, Current" : "Signed out"}
											</span>
										</td>
									</tr>
								);
							})
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}
