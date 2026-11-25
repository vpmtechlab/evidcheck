"use client";

import { motion } from "framer-motion";

export interface TourCoords {
	top: number;
	left: number;
	width: number;
	height: number;
}

export const EMPTY_COORDS: TourCoords = { top: 0, left: 0, width: 0, height: 0 };

export function centerFallbackCoords(): TourCoords {
	return {
		top: window.innerHeight / 2 - 40 + window.scrollY,
		left: window.innerWidth / 2 - 100 + window.scrollX,
		width: 200,
		height: 80,
	};
}

export function coordsForElement(el: Element): TourCoords {
	const rect = el.getBoundingClientRect();
	return {
		top: rect.top + window.scrollY,
		left: rect.left + window.scrollX,
		width: rect.width,
		height: rect.height,
	};
}

interface TourSpotlightProps {
	coords: TourCoords;
	onSkip: () => void;
}

export function TourSpotlight({ coords, onSkip }: TourSpotlightProps) {
	return (
		<>
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				className="absolute inset-0 bg-black/65 pointer-events-auto"
				style={{
					clipPath: `polygon(
						0% 0%,
						0% 100%,
						${coords.left}px 100%,
						${coords.left}px ${coords.top}px,
						${coords.left + coords.width}px ${coords.top}px,
						${coords.left + coords.width}px ${coords.top + coords.height}px,
						${coords.left}px ${coords.top + coords.height}px,
						${coords.left}px 100%,
						100% 100%,
						100% 0%
					)`,
				}}
				onClick={onSkip}
			/>

			<motion.div
				animate={{ scale: [1, 1.04, 1], opacity: [0.3, 0.7, 0.3] }}
				transition={{ duration: 2, repeat: Infinity }}
				className="absolute border-2 border-brand rounded-lg pointer-events-none"
				style={{
					top: coords.top - 4,
					left: coords.left - 4,
					width: coords.width + 8,
					height: coords.height + 8,
				}}
			/>
		</>
	);
}
