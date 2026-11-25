"use client";

import { Loader2, StopCircle, AlertTriangle } from "lucide-react";
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

interface CancelJobDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	jobId: string;
	isCancelling: boolean;
	onConfirm: () => void;
}

export function CancelJobDialog({
	open,
	onOpenChange,
	jobId,
	isCancelling,
	onConfirm,
}: CancelJobDialogProps) {
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent className="sm:max-w-md rounded-lg">
				<AlertDialogHeader className="flex flex-col items-center">
					<div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3 text-red-600">
						<AlertTriangle size={24} />
					</div>
					<AlertDialogTitle className="text-base font-bold">
						Terminate Verification Job?
					</AlertDialogTitle>
					<AlertDialogDescription className="text-center text-xs text-gray-600">
						Are you sure you want to terminate job <code className="font-mono text-gray-900 font-bold bg-gray-100 px-1 py-0.5 rounded">{jobId}</code>? The status will be permanently marked as <span className="font-bold text-red-600">cancelled</span>.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter className="flex-row gap-2 justify-between mt-4">
					<AlertDialogCancel className="mt-0 flex-1 text-xs rounded-md">
						Keep Running
					</AlertDialogCancel>
					<Button
						onClick={onConfirm}
						disabled={isCancelling}
						className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-md gap-1.5"
					>
						{isCancelling ? <Loader2 size={13} className="animate-spin" /> : <StopCircle size={13} />}
						<span>Confirm Termination</span>
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
