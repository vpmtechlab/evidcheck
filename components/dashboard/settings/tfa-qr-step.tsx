"use client";

import Image from "next/image";
import { Loader2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TfaQrStepProps {
	secret: string;
	qrCodeUrl: string;
	copied: boolean;
	onCopy: (text: string) => void;
	onScanned: () => void;
}

export function TfaQrStep({ secret, qrCodeUrl, copied, onCopy, onScanned }: TfaQrStepProps) {
	return (
		<div className="space-y-6">
			<div className="flex flex-col items-center">
				<div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-4 min-w-[200px] min-h-[200px] flex items-center justify-center">
					{qrCodeUrl ? (
						<Image
							src={qrCodeUrl}
							alt="2FA QR Code"
							width={160}
							height={160}
							className="animate-in fade-in duration-500"
						/>
					) : (
						<div className="size-40 bg-gray-50 animate-pulse rounded-lg flex items-center justify-center">
							<Loader2 className="animate-spin text-gray-300" />
						</div>
					)}
				</div>
				<p className="text-center text-sm text-gray-500 mb-4 px-4">
					Scan this QR code with your authenticator app.
				</p>
				<div className="w-full p-3 bg-gray-50 rounded-lg flex items-center justify-between border border-gray-100">
					<code className="text-xs font-mono text-gray-600">
						{secret}
					</code>
					<button
						onClick={() => onCopy(secret)}
						className="text-blue-600 hover:text-blue-700 p-1"
					>
						{copied ? <Check size={16} /> : <Copy size={16} />}
					</button>
				</div>
				<p className="text-[10px] text-gray-400 mt-2">
					Can&apos;t scan? Use the secret key above.
				</p>
			</div>
			<Button
				onClick={onScanned}
				className="w-full bg-secondary hover:bg-gray-800 text-white"
			>
				I&apos;ve Scanned It
			</Button>
		</div>
	);
}
