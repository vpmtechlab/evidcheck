"use client";

import { Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { ApiKeyMode } from "./api-key-card";

interface RollKeyDialogProps {
	mode: ApiKeyMode | null;
	loading: boolean;
	onClose: () => void;
	onConfirm: (mode: ApiKeyMode) => void;
}

export function RollKeyDialog({ mode, loading, onClose, onConfirm }: RollKeyDialogProps) {
	return (
		<AlertDialog open={!!mode} onOpenChange={onClose}>
			<AlertDialogContent className="sm:max-w-sm rounded-lg">
				<AlertDialogHeader className="flex flex-col items-center">
					<div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3 text-red-600">
						<AlertTriangle size={24} />
					</div>
					<AlertDialogTitle className="text-base font-bold">
						Roll {mode?.toUpperCase()} API Key?
					</AlertDialogTitle>
					<AlertDialogDescription className="text-center text-xs text-gray-600">
						Your existing {mode} API key will be immediately revoked. Any active applications using this key will fail to authenticate.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter className="flex-row gap-2 justify-between mt-4">
					<AlertDialogCancel className="mt-0 flex-1 text-xs rounded-md">Cancel</AlertDialogCancel>
					<Button
						onClick={() => mode && onConfirm(mode)}
						disabled={loading}
						className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-md disabled:opacity-50"
					>
						{loading ? <Loader2 size={13} className="animate-spin" /> : "Confirm Roll"}
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
