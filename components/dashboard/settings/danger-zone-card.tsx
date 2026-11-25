"use client";

import { Button } from "@/components/ui/button";

export function DangerZoneCard() {
	return (
		<div>
			<h3 className="text-lg font-bold text-red-600 mb-3">Danger Zone</h3>
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-red-100 bg-red-50 rounded-xl">
				<div>
					<h4 className="font-medium text-gray-900">Delete Account</h4>
					<p className="text-sm text-gray-500 mt-1">
						Permanently delete your account and all data.
					</p>
				</div>
				<Button
					variant="outline"
					className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 w-full sm:w-auto"
				>
					Delete Account
				</Button>
			</div>
		</div>
	);
}
