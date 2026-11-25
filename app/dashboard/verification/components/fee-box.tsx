"use client";

interface VerificationFeeBoxProps {
	isCachedPrice: boolean;
	activeFee: number;
	cachedFetchedAt?: number;
}

export function VerificationFeeBox({ isCachedPrice, activeFee, cachedFetchedAt }: VerificationFeeBoxProps) {
	return (
		<div className={`text-right px-3 py-1.5 rounded-md border ${isCachedPrice ? "bg-blue-50/80 border-blue-200" : "bg-green-50/80 border-green-200"}`}>
			<span className="text-[10px] text-gray-500 font-medium block">
				{isCachedPrice ? "Cached Result · 50% off" : "Verification Fee"}
			</span>
			<span className={`text-sm font-bold font-mono ${isCachedPrice ? "text-blue-700" : "text-brand"}`}>
				${activeFee.toFixed(2)} USD
			</span>
			{isCachedPrice && cachedFetchedAt && (
				<span className="text-[10px] text-gray-500 font-mono block">
					Verified {new Date(cachedFetchedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
				</span>
			)}
		</div>
	);
}
