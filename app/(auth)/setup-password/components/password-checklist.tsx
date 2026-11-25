"use client";

import { cn } from "@/lib/utils";

interface PasswordChecklistProps {
	hasLength: boolean;
	hasUpperCase: boolean;
	hasLowerCase: boolean;
	hasSpecialChar: boolean;
}

export function PasswordChecklist({ hasLength, hasUpperCase, hasLowerCase, hasSpecialChar }: PasswordChecklistProps) {
	const rules = [
		{ ok: hasLength, label: "8+ characters" },
		{ ok: hasUpperCase, label: "Uppercase letter" },
		{ ok: hasLowerCase, label: "Lowercase letter" },
		{ ok: hasSpecialChar, label: "Special character" },
	];

	return (
		<div className="grid grid-cols-2 gap-2 mt-3 text-[11px]">
			{rules.map((rule) => (
				<div
					key={rule.label}
					className={cn(
						"flex items-center gap-1.5",
						rule.ok ? "text-green-600 font-medium" : "text-gray-400"
					)}
				>
					<div
						className={cn(
							"w-1.5 h-1.5 rounded-full",
							rule.ok ? "bg-green-600" : "bg-gray-300"
						)}
					/>
					{rule.label}
				</div>
			))}
		</div>
	);
}
