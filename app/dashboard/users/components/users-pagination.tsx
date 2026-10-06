"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UsersPaginationProps {
	currentPage: number;
	totalPages: number;
	total: number;
	itemsPerPage: number;
	onPageChange: (page: number) => void;
}

export function UsersPagination({ currentPage, totalPages, total, itemsPerPage, onPageChange }: UsersPaginationProps) {
	const from = total === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
	const to = Math.min(currentPage * itemsPerPage, total);

	return (
		<div className="p-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 bg-gray-50/50">
			<p className="font-medium">
				Showing <span className="text-gray-900 font-bold">{from}</span> to{" "}
				<span className="text-gray-900 font-bold">{to}</span> of{" "}
				<span className="text-gray-900 font-bold">{total}</span> members
			</p>
			<div className="flex items-center gap-2">
				<Button
					variant="outline"
					size="sm"
					onClick={() => onPageChange(Math.max(1, currentPage - 1))}
					disabled={currentPage === 1}
					className="h-8 px-2.5 rounded-md border-gray-300 bg-white text-xs disabled:opacity-50"
				>
					<ChevronLeft size={14} className="mr-1" /> Previous
				</Button>
				<span className="font-mono font-bold text-gray-700">
					{currentPage} / {Math.max(1, totalPages)}
				</span>
				<Button
					variant="outline"
					size="sm"
					onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
					disabled={currentPage >= totalPages || totalPages === 0}
					className="h-8 px-2.5 rounded-md border-gray-300 bg-white text-xs disabled:opacity-50"
				>
					Next <ChevronRight size={14} className="ml-1" />
				</Button>
			</div>
		</div>
	);
}
