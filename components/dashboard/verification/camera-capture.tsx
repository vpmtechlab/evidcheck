"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Camera, RefreshCw, Check, AlertCircle, Upload, Sparkles, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CameraCaptureProps {
	onCapture: (imageDataUrl: string) => void;
	capturedImage: string | null;
	onReset: () => void;
}

export function CameraCapture({
	onCapture,
	capturedImage,
	onReset,
}: CameraCaptureProps) {
	const videoRef = useRef<HTMLVideoElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [stream, setStream] = useState<MediaStream | null>(null);
	const [cameraActive, setCameraActive] = useState(false);
	const [cameraError, setCameraError] = useState<string | null>(null);
	const [isStartingCamera, setIsStartingCamera] = useState(false);

	const stopCamera = useCallback(() => {
		if (stream) {
			stream.getTracks().forEach((track) => {
				try {
					track.stop();
				} catch {
					// Ignore track stop errors
				}
			});
			setStream(null);
		}
		setCameraActive(false);
	}, [stream]);

	const startCamera = async () => {
		setIsStartingCamera(true);
		setCameraError(null);

		try {
			if (
				typeof window === "undefined" ||
				!navigator ||
				!navigator.mediaDevices ||
				!navigator.mediaDevices.getUserMedia
			) {
				setCameraError(
					"Camera is not supported or permitted in this environment. Please upload a photo instead.",
				);
				setCameraActive(false);
				return;
			}

			const mediaStream = await navigator.mediaDevices.getUserMedia({
				video: {
					width: { ideal: 640 },
					height: { ideal: 480 },
					facingMode: "user",
				},
				audio: false,
			});

			setStream(mediaStream);
			setCameraActive(true);

			if (videoRef.current) {
				videoRef.current.srcObject = mediaStream;
				try {
					await videoRef.current.play();
				} catch (e) {
					console.warn("Video autoplay blocked, user interaction required:", e);
				}
			}
		} catch (err: unknown) {
			console.error("Camera access failed:", err);
			const error = err as Error;
			setCameraError(
				error.message ||
					"Unable to access camera. Please check browser permissions or upload a photo manually.",
			);
			setCameraActive(false);
		} finally {
			setIsStartingCamera(false);
		}
	};

	useEffect(() => {
		return () => {
			if (stream) {
				stream.getTracks().forEach((track) => track.stop());
			}
		};
	}, [stream]);

	const handleTakePhoto = () => {
		if (!videoRef.current || !canvasRef.current) return;

		const video = videoRef.current;
		const canvas = canvasRef.current;
		canvas.width = video.videoWidth || 640;
		canvas.height = video.videoHeight || 480;

		const context = canvas.getContext("2d");
		if (context) {
			// Mirror the snapshot so it matches what the user sees
			context.translate(canvas.width, 0);
			context.scale(-1, 1);
			context.drawImage(video, 0, 0, canvas.width, canvas.height);

			const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
			stopCamera();
			onCapture(dataUrl);
			toast.success("Selfie captured successfully!");
		}
	};

	const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (!file.type.startsWith("image/")) {
			toast.error("Please select a valid image file (JPG/PNG).");
			return;
		}

		const reader = new FileReader();
		reader.onload = () => {
			stopCamera();
			onCapture(reader.result as string);
			toast.success("Photo uploaded successfully!");
		};
		reader.readAsDataURL(file);
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<label className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
					<Sparkles size={16} className="text-teal-600" />
					SmartSelfie™ Biometric Capture *
				</label>
				{capturedImage && (
					<span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
						<Check size={12} /> Photo Ready
					</span>
				)}
			</div>

			{/* Main Preview Container */}
			<div className="relative w-full max-w-md mx-auto aspect-4/3 bg-slate-900 rounded-2xl overflow-hidden border-2 border-slate-200 shadow-inner flex items-center justify-center">
				{capturedImage ? (
					// Captured Image Review
					<div className="relative w-full h-full">
						<img
							src={capturedImage}
							alt="Captured Selfie"
							className="w-full h-full object-cover"
						/>
						<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
							<div className="text-white text-xs">
								<p className="font-semibold">Selfie Captured</p>
								<p className="text-slate-300 text-[11px]">Ready for AI liveness and identity analysis</p>
							</div>
						</div>
					</div>
				) : cameraActive ? (
					// Live Camera Stream
					<div className="relative w-full h-full">
						<video
							ref={videoRef}
							autoPlay
							playsInline
							muted
							className="w-full h-full object-cover transform -scale-x-100"
						/>
						{/* Face Oval Overlay Guide */}
						<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
							<div className="w-48 h-64 border-2 border-dashed border-teal-400/80 rounded-full shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
						</div>
						<div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[11px] text-teal-300 font-medium flex items-center gap-1.5">
							<span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
							Live Liveness Feed
						</div>
						<div className="absolute bottom-3 inset-x-0 text-center text-white/90 text-xs font-medium pointer-events-none drop-shadow">
							Position your face inside the oval
						</div>
					</div>
				) : (
					// Camera Inactive / Initial State
					<div className="text-center p-6 space-y-3">
						<div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
							<Camera size={24} />
						</div>
						{cameraError ? (
							<div className="text-xs text-rose-400 max-w-[280px] mx-auto flex items-center gap-1.5 text-left">
								<AlertCircle size={16} className="shrink-0" />
								<span>{cameraError}</span>
							</div>
						) : (
							<p className="text-xs text-slate-300">
								Click below to enable your camera for live liveness verification
							</p>
						)}
						<Button
							type="button"
							size="sm"
							onClick={startCamera}
							disabled={isStartingCamera}
							className="bg-teal-600 hover:bg-teal-700 text-white text-xs gap-1.5 shadow-md"
						>
							<Video size={14} />
							{isStartingCamera ? "Starting Camera..." : "Enable Camera"}
						</Button>
					</div>
				)}

				<canvas ref={canvasRef} className="hidden" />
			</div>

			{/* Controls */}
			<div className="flex items-center justify-center gap-3">
				{capturedImage ? (
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => {
							onReset();
							startCamera();
						}}
						className="gap-1.5 text-xs text-slate-700"
					>
						<RefreshCw size={14} />
						Retake Photo
					</Button>
				) : cameraActive ? (
					<Button
						type="button"
						size="sm"
						onClick={handleTakePhoto}
						className="bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs px-6 py-2 shadow-md gap-2"
					>
						<Camera size={16} />
						Capture Selfie
					</Button>
				) : null}

				{/* File Upload Fallback */}
				<input
					ref={fileInputRef}
					type="file"
					accept="image/*"
					onChange={handleFileUpload}
					className="hidden"
				/>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={() => fileInputRef.current?.click()}
					className="text-xs text-slate-600 hover:text-slate-900 gap-1.5"
				>
					<Upload size={14} />
					{capturedImage ? "Replace from file" : "Upload photo instead"}
				</Button>
			</div>
		</div>
	);
}
