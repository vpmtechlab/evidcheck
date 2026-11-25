"use client";

import React, { useState } from "react";
import { Search, ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface BillingTransaction {
	_id: string;
	type: string;
	amount: number;
	status: string;
	createdAt: number;
}

const PAGE_SIZE = 10;

const STATUS_STYLES: Record<string, string> = {
	success: "bg-green-100 text-green-700",
	pending: "bg-yellow-100 text-yellow-700",
};

function formatDate(ts: number): string {
	return new Date(ts).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

export function TransactionsTable({ transactions }: { transactions: BillingTransaction[] | undefined }) {
	const [searchTerm, setSearchTerm] = useState("");
	const [currentPage, setCurrentPage] = useState(1);

	const filtered = (transactions || []).filter((row) =>
		row._id.toString().slice(-8).toUpperCase().includes(searchTerm.toUpperCase())
	);
	const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
	const currentData = filtered.slice(
		(currentPage - 1) * PAGE_SIZE,
		currentPage * PAGE_SIZE
	);

	return (
		<div className="bg-white border text-sm border-gray-200 rounded-lg overflow-hidden shadow-2xs">
			<div className="p-4 border-b border-gray-200">
				<div className="relative w-full max-w-sm">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
					<Input
						placeholder="Search Transaction ID"
						aria-label="Search transactions"
						className="pl-9 bg-gray-50 border-gray-200 h-9 text-xs"
						value={searchTerm}
						onChange={(e) => {
							setSearchTerm(e.target.value);
							setCurrentPage(1);
						}}
					/>
				</div>
			</div>

			<div className="overflow-x-auto">
				<Table>
					<TableHeader className="bg-gray-50/80 border-b border-gray-200">
						<TableRow>
							<TableHead className="font-bold text-gray-700">Transaction ID</TableHead>
							<TableHead className="font-bold text-gray-700">Date</TableHead>
							<TableHead className="font-bold text-gray-700">Type</TableHead>
							<TableHead className="font-bold text-gray-700">Amount</TableHead>
							<TableHead className="font-bold text-gray-700">Status</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{transactions === undefined ? (
							<TableRow>
								<TableCell colSpan={5} className="h-24 text-center text-xs text-gray-500">
									Loading transactions...
								</TableCell>
							</TableRow>
						) : currentData.length > 0 ? (
							currentData.map((row) => {
								const isTopUp = row.type === "top_up";
								return (
									<TableRow key={row._id} className="hover:bg-gray-50 transition-colors text-xs">
										<TableCell className="font-mono font-bold text-gray-900">
											{row._id.toString().slice(-12).toUpperCase()}
										</TableCell>
										<TableCell className="text-gray-600 whitespace-nowrap">{formatDate(row.createdAt)}</TableCell>
										<TableCell>
											<span className="flex items-center gap-1.5 capitalize font-medium text-gray-700">
												{isTopUp ? (
													<ArrowDownLeft size={14} className="text-green-600" />
												) : (
													<ArrowUpRight size={14} className="text-red-500" />
												)}
												{row.type.replace("_", " ")}
											</span>
										</TableCell>
										<TableCell>
											<span className={cn("font-mono font-bold", isTopUp ? "text-green-700" : "text-red-600")}>
												{isTopUp ? "+" : "-"}${row.amount.toFixed(2)}
											</span>
										</TableCell>
										<TableCell>
											<span className={cn(
												"px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
												STATUS_STYLES[row.status] ?? "bg-red-100 text-red-700"
											)}>
												{row.status}
											</span>
										</TableCell>
									</TableRow>
								);
							})
						) : (
							<TableRow>
								<TableCell colSpan={5} className="h-24 text-center text-xs text-gray-500">
									No transactions found.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			<div className="p-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
				<p className="font-mono">
					{filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1} to{" "}
					{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
				</p>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
						disabled={currentPage === 1}
						className="h-8 px-2 rounded-md disabled:opacity-50"
					>
						<ChevronLeft className="h-4 w-4" />
					</Button>
					<span className="px-2 font-bold text-gray-700 font-mono">
						Page {currentPage} of {Math.max(1, totalPages)}
					</span>
					<Button
						variant="outline"
						size="sm"
						onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
						disabled={currentPage >= totalPages || totalPages === 0}
						className="h-8 px-2 rounded-md disabled:opacity-50"
					>
						<ChevronRight className="h-4 w-4" />
					</Button>
				</div>
			</div>
		</div>
	);
}
