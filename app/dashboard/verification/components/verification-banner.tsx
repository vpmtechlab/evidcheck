"use client";

import { motion } from "framer-motion";
import { Shield } from "lucide-react";

export function VerificationBanner() {
	return (
		<motion.div
			initial={{ opacity: 0, y: -10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
			className="p-6 bg-navy text-white border-b-2 border-brand rounded-lg shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
		>
			<div className="flex items-center gap-3.5">
				<div className="p-2.5 rounded-md shrink-0 shadow-xs bg-brand text-white">
					<Shield size={24} />
				</div>
				<div>
					<h1 className="text-lg md:text-xl font-bold tracking-tight text-white">
						Identity & Compliance Verification
					</h1>
					<p className="text-gray-300 text-xs mt-0.5">
						Direct validation against BRS, IPRS, KRA iTax & CRB Databases
					</p>
				</div>
			</div>

			<div className="flex items-center gap-2 px-3 py-1 text-xs font-mono font-medium text-white rounded-md shrink-0 bg-white/10">
				<span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
				<span>4 Core Verification Services</span>
			</div>
		</motion.div>
	);
}
