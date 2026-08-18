"use client";

import React, { useRef, useState } from "react";
import { UploadCloud, FileText, Trash2, CheckCircle2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface DocumentUploadProps {
	label?: string;
	description?: string;
	onUpload: (fileDataUrl: string, fileName: string) => void;
	documentData: string | null;
	documentName: string | null;
	onRemove: () => void;
}

export function DocumentUpload({
	label = "Upload Supporting Document *",
	description = "Upload a recent Utility Bill, Bank Statement, or Tenancy Agreement (PDF, PNG, JPG up to 10MB)",
	onUpload,
	documentData,
	documentName,
	onRemove,
}: DocumentUploadProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isDragging, setIsDragging] = useState(false);

	const processFile = (file: File) => {
		if (file.size > 10 * 1024 * 1024) {
			toast.error("File is too large. Maximum size is 10MB.");
			return;
		}

		const validTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
		if (!validTypes.includes(file.type)) {
			toast.error("Unsupported file format. Please upload a PDF, PNG, or JPG.");
			return;
		}

		const reader = new FileReader();
		reader.onload = () => {
			onUpload(reader.result as string, file.name);
			toast.success(`"${file.name}" uploaded successfully!`);
		};
		reader.readAsDataURL(file);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
		const file = e.dataTransfer.files?.[0];
		if (file) processFile(file);
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
	};

	return (
		<div className="space-y-3">
			<div>
				<label className="text-sm font-semibold text-gray-900">{label}</label>
				<p className="text-xs text-gray-500 mt-0.5">{description}</p>
			</div>

			<input
				ref={fileInputRef}
				type="file"
				accept=".pdf,.png,.jpg,.jpeg"
				onChange={(e) => {
					const file = e.target.files?.[0];
					if (file) processFile(file);
				}}
				className="hidden"
			/>

			{documentData ? (
				// Uploaded Document Preview Card
				<div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
					<div className="flex items-center gap-3 overflow-hidden">
						<div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
							{documentData.startsWith("data:image/") ? (
								<ImageIcon size={20} />
							) : (
								<FileText size={20} />
							)}
						</div>
						<div className="truncate">
							<p className="text-xs font-semibold text-gray-900 truncate">
								{documentName || "Uploaded Document"}
							</p>
							<span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium mt-0.5">
								<CheckCircle2 size={12} /> Ready for verification
							</span>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => fileInputRef.current?.click()}
							className="text-xs h-8 text-slate-700"
						>
							Change
						</Button>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={onRemove}
							className="text-xs h-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
						>
							<Trash2 size={14} />
						</Button>
					</div>
				</div>
			) : (
				// Drag and Drop Zone
				<div
					onDrop={handleDrop}
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onClick={() => fileInputRef.current?.click()}
					className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
						isDragging
							? "border-teal-500 bg-teal-50/50 scale-[1.01]"
							: "border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50"
					}`}
				>
					<div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-2">
						<UploadCloud size={20} />
					</div>
					<p className="text-xs font-semibold text-gray-800">
						Click to upload or drag & drop document
					</p>
					<p className="text-[11px] text-gray-500 mt-1">
						PDF, PNG, or JPG (max 10MB)
					</p>
				</div>
			)}
		</div>
	);
}
