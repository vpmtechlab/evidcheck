"use client";

import { getAuthorityInfo } from "./job-display";

interface AuthorityCardProps {
	serviceType: string;
	entityData: Record<string, string>;
}

function maskIdentifier(id?: string): string {
	if (!id) return "";
	if (id.length <= 4) return "****";
	return id.substring(0, 2) + "****" + id.substring(id.length - 2);
}

export function AuthorityCard({ serviceType, entityData }: AuthorityCardProps) {
	const authority = getAuthorityInfo(serviceType);
	const AuthLogo = authority.logo;

	return (
		<div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4 shadow-2xs">
			<div className="flex items-start justify-between">
				<div>
					<span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block font-mono">
						ID Authority Queried:
					</span>
					<div className="flex items-center gap-2.5 mt-2">
						<div className={`p-2 rounded-md border ${authority.color}`}>
							<AuthLogo size={20} />
						</div>
						<div>
							<h3 className="text-sm font-bold text-gray-900 leading-tight">
								{authority.name}
							</h3>
							<span className="text-[10px] text-gray-500 font-mono">{authority.code}</span>
						</div>
					</div>
				</div>
			</div>

			<div className="space-y-2 pt-2 border-t border-gray-100 text-xs">
				<div className="flex items-center justify-between">
					<span className="text-gray-500 font-medium">Country:</span>
					<span className="font-bold text-gray-900 font-mono">{entityData.country || "KE"}</span>
				</div>
				<div className="flex items-center justify-between">
					<span className="text-gray-500 font-medium">ID Type:</span>
					<span className="font-bold text-gray-900 font-mono uppercase">
						{serviceType?.toUpperCase()}
					</span>
				</div>
				{entityData.companyNumber && (
					<div className="flex items-center justify-between">
						<span className="text-gray-500 font-medium">Registration Number:</span>
						<span className="font-bold text-gray-900 font-mono">{entityData.companyNumber}</span>
					</div>
				)}
				{entityData.idNumber && (
					<div className="flex items-center justify-between">
						<span className="text-gray-500 font-medium">ID / Doc Number:</span>
						<span className="font-bold text-gray-900 font-mono">{maskIdentifier(entityData.idNumber)}</span>
					</div>
				)}
				{entityData.pin && (
					<div className="flex items-center justify-between">
						<span className="text-gray-500 font-medium">KRA PIN:</span>
						<span className="font-bold text-gray-900 font-mono">{maskIdentifier(entityData.pin)}</span>
					</div>
				)}
				<div className="flex items-center justify-between pt-1">
					<span className="text-gray-500 font-medium">Privacy Protection:</span>
					<span className="font-bold text-emerald-600 font-mono text-[10px] uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
						Zero-Cache Enforced
					</span>
				</div>
			</div>
		</div>
	);
}
