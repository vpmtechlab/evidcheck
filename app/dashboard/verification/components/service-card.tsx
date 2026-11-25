"use client";

import { motion } from "framer-motion";
import { Check, ArrowRight, Shield } from "lucide-react";
import { iconRegistry } from "@/lib/icon-registry";
import type { ServiceType } from "./choose-service";

export interface ServiceMeta {
	target: string;
	targetBg: string;
	subtitle: string;
}

interface ServiceCardProps {
	service: ServiceType;
	meta: ServiceMeta;
	isSelected: boolean;
	onSelect: (service: ServiceType) => void;
}

export function ServiceCard({ service, meta, isSelected, onSelect }: ServiceCardProps) {
	const ServiceIcon = iconRegistry[service.icon] ?? Shield;

	return (
		<motion.button
			type="button"
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
			whileHover={{ y: -2, scale: 1.005 }}
			whileTap={{ scale: 0.99 }}
			onClick={() => onSelect(service)}
			aria-pressed={isSelected}
			className={`
				w-full text-left p-5 bg-white border rounded-lg transition-all cursor-pointer group relative flex flex-col justify-between select-none
				${
					isSelected
						? "border-brand ring-2 ring-brand/20 shadow-sm bg-green-50/10"
						: "border-gray-200 hover:border-gray-300 hover:shadow-xs"
				}
			`}
		>
			<div className="space-y-3">
				<div className="flex items-start justify-between">
					<div className="flex items-center gap-3">
						<div className={`p-2.5 ${service.color} rounded-md shrink-0 shadow-2xs`}>
							<ServiceIcon size={22} />
						</div>
						<div>
							<h3 className="font-bold text-sm text-gray-900 group-hover:text-brand transition-colors leading-tight">
								{service.name}
							</h3>
							<span className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 border rounded-md ${meta.targetBg}`}>
								{meta.target}
							</span>
						</div>
					</div>

					<ArrowRight
						size={16}
						className="text-gray-400 group-hover:text-brand group-hover:translate-x-1 transition-all mt-1"
					/>
				</div>

				<p className="text-xs text-gray-600 leading-relaxed">
					{meta.subtitle}
				</p>
			</div>

			<div className="pt-3 mt-3 border-t border-gray-100 flex flex-wrap gap-1.5">
				{service.actions.slice(0, 2).map((action) => (
					<span
						key={action._id}
						className="inline-flex items-center gap-1 text-[10px] text-gray-500 font-mono bg-gray-50 px-2 py-0.5 border border-gray-200 rounded-sm"
					>
						<Check size={10} className="text-brand" />
						{action.label}
					</span>
				))}
			</div>
		</motion.button>
	);
}
