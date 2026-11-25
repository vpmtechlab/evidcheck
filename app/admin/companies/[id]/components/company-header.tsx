"use client";

import Link from "next/link";
import { Building2, Globe, ArrowLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CompanyHeaderProps {
	name: string;
	domain: string;
	onBack: () => void;
}

export function CompanyHeader({ name, domain, onBack }: CompanyHeaderProps) {
	return (
		<div className="space-y-3 pb-4 border-b border-gray-200">
			<div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
				<Link href="/admin/companies" className="hover:text-brand transition-colors">Organizations</Link>
				<ChevronRight className="w-3.5 h-3.5 text-gray-400" />
				<span className="text-gray-900 font-bold">{name}</span>
			</div>

			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 bg-navy text-white rounded-md flex items-center justify-center font-bold">
						<Building2 className="w-5 h-5" />
					</div>
					<div>
						<h1 className="text-xl font-bold text-gray-900 tracking-tight">{name}</h1>
						<p className="text-gray-500 flex items-center gap-1 text-xs mt-0.5 font-mono">
							<Globe className="w-3 h-3 text-gray-400" /> {domain}
						</p>
					</div>
				</div>
				<Button
					variant="outline"
					size="sm"
					className="gap-1.5 text-xs font-semibold rounded-md border-gray-300 self-start sm:self-auto h-8 text-gray-700 hover:bg-gray-50"
					onClick={onBack}
				>
					<ArrowLeft className="w-3.5 h-3.5" /> Back to List
				</Button>
			</div>
		</div>
	);
}
