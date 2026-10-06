"use client";

function HintKey({ children }: { children: React.ReactNode }) {
	return (
		<kbd className="px-1 py-0.5 bg-white border border-gray-200 rounded-[3px] text-[10px] font-bold">
			{children}
		</kbd>
	);
}

export function PaletteFooter() {
	return (
		<div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/80 flex items-center justify-between">
			<div className="flex items-center gap-3 text-[10px] text-gray-400 font-medium">
				<span className="flex items-center gap-1">
					<HintKey>↑</HintKey>
					<HintKey>↓</HintKey>
					navigate
				</span>
				<span className="flex items-center gap-1">
					<HintKey>↵</HintKey>
					select
				</span>
				<span className="flex items-center gap-1">
					<kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded-[3px] text-[10px] font-bold">esc</kbd>
					close
				</span>
			</div>
			<div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold">
				<div className="w-3 h-3 bg-brand rounded-xs flex items-center justify-center text-[8px] text-white font-black">E</div>
				EvidCheck
			</div>
		</div>
	);
}
