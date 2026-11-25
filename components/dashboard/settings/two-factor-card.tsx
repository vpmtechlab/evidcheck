"use client";

import { Shield } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface TwoFactorCardProps {
	enabled: boolean;
	onToggle: (checked: boolean) => void;
}

export function TwoFactorCard({ enabled, onToggle }: TwoFactorCardProps) {
	return (
		<div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
			<div className="flex gap-4">
				<div className="p-3 bg-blue-100 rounded-lg h-fit shrink-0">
					<Shield className="text-blue-600" size={24} />
				</div>
				<div>
					<h3 className="text-lg font-bold text-gray-900">
						Two-Factor Authentication
					</h3>
					<p className="text-sm text-gray-600 mt-1 max-w-lg mb-4">
						Add an extra layer of security to your account by requiring both
						your password and a code from your mobile device.
					</p>
					<div className="flex items-center space-x-2">
						<Switch
							id="2fa-toggle"
							checked={enabled}
							onCheckedChange={onToggle}
						/>
						<Label
							htmlFor="2fa-toggle"
							className="font-medium cursor-pointer"
						>
							{enabled ? "Enabled" : "Disabled"}
						</Label>
					</div>
				</div>
			</div>
		</div>
	);
}
