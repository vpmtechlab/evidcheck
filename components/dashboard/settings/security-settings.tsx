import React, { useState, useContext, useEffect } from "react";
import QRCode from "qrcode";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AppContext } from "@/components/providers/app-provider";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";
import { getSessionToken } from "@/lib/session-token";
import { TwoFactorCard } from "./two-factor-card";
import { TwoFactorSetupModal, type TfaSetupStep } from "./two-factor-setup-modal";
import { ChangePasswordCard, type PasswordFields } from "./change-password-card";
import { LoginHistoryTable } from "./login-history-table";
import { DangerZoneCard } from "./danger-zone-card";

export function SecuritySettings() {
	const { member } = useContext(AppContext);
	const user = useQuery(
		api.session.getSessionUser,
		getSessionToken() ? { sessionToken: getSessionToken() as string } : "skip",
	);

	const changePassword = useMutation(api.users.changePassword);
	const generateSecret = useMutation(api.auth.generate2FASecret);
	const verifyAndEnable = useMutation(api.auth.verifyAndEnable2FA);
	const disable2FA = useMutation(api.auth.disable2FA);

	const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
	const [setupStep, setSetupStep] = useState<TfaSetupStep>("intro");
	const [setupData, setSetupData] = useState<{ secret: string; otpauth: string } | null>(null);
	const [otpCode, setOtpCode] = useState("");
	const [isVerifying, setIsVerifying] = useState(false);
	const [isGenerating, setIsGenerating] = useState(false);
	const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
	const [copied, setCopied] = useState(false);

	const [loading, setLoading] = useState(false);
	const [passwords, setPasswords] = useState<PasswordFields>({ current: "", new: "", confirm: "" });

	const loginHistoryLogs = useQuery(
		api.audit.getLoginHistoryByUser,
		member?.id ? { sessionToken: getSessionToken() ?? "", userId: member.id as Id<"users"> } : "skip",
	);

	const resetSetup = () => {
		setSetupStep("intro");
		setSetupData(null);
		setQrCodeUrl("");
		setOtpCode("");
		setCopied(false);
	};

	useEffect(() => {
		if (setupData?.otpauth) {
			QRCode.toDataURL(setupData.otpauth)
				.then((url) => setQrCodeUrl(url))
				.catch((err) => {
					console.error("Failed to generate QR code:", err);
					toast.error("Failed to generate QR code.");
				});
		}
	}, [setupData]);

	const handlePasswordChange = async () => {
		if (!member?.id) return;
		if (!passwords.new || passwords.new !== passwords.confirm) {
			toast.error("New passwords do not match.");
			return;
		}
		setLoading(true);
		try {
			await changePassword({
				sessionToken: getSessionToken() ?? "",
				userId: member.id as Id<"users">,
				currentPassword: passwords.current,
				newPassword: passwords.new,
			});
			toast.success("Password updated successfully!");
			setPasswords({ current: "", new: "", confirm: "" });
		} catch (error: unknown) {
			toast.error(getErrorMessage(error));
		} finally {
			setLoading(false);
		}
	};

	const handle2FAToggle = async (checked: boolean) => {
		if (!member?.id) return;
		if (!checked) {
			const code = window.prompt("Enter your current 2FA code to disable two-factor authentication:");
			if (!code) return;
			try {
				await disable2FA({ sessionToken: getSessionToken() ?? "", userId: member.id as Id<"users">, code });
				toast.success("Two-Factor Authentication disabled.");
			} catch (error) {
				toast.error(getErrorMessage(error));
			}
			return;
		}
		setSetupStep("intro");
		setIs2FAModalOpen(true);
	};

	const handleStartSetup = async () => {
		if (!member?.id) return;
		setIsGenerating(true);
		try {
			const data = await generateSecret({ sessionToken: getSessionToken() ?? "", userId: member.id as Id<"users"> });
			setSetupData(data);
			setSetupStep("qr");
		} catch (error) {
			toast.error(getErrorMessage(error));
		} finally {
			setIsGenerating(false);
		}
	};

	const handleVerifySetup = async () => {
		if (!member?.id || !setupData || otpCode.length < 6) return;
		setIsVerifying(true);
		try {
			await verifyAndEnable({
				sessionToken: getSessionToken() ?? "",
				userId: member.id as Id<"users">,
				secret: setupData.secret,
				code: otpCode,
			});
			toast.success("Two-Factor Authentication enabled!");
			setIs2FAModalOpen(false);
			resetSetup();
		} catch (error: unknown) {
			toast.error(getErrorMessage(error));
		} finally {
			setIsVerifying(false);
		}
	};

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div className="space-y-8">
			<TwoFactorCard
				enabled={user?.twoFactorEnabled ?? false}
				onToggle={handle2FAToggle}
			/>

			{is2FAModalOpen && (
				<TwoFactorSetupModal
					step={setupStep}
					secret={setupData?.secret ?? null}
					qrCodeUrl={qrCodeUrl}
					otpCode={otpCode}
					copied={copied}
					isGenerating={isGenerating}
					isVerifying={isVerifying}
					onClose={() => {
						setIs2FAModalOpen(false);
						resetSetup();
					}}
					onStart={handleStartSetup}
					onScanned={() => setSetupStep("verify")}
					onVerify={handleVerifySetup}
					onBackToQr={() => setSetupStep("qr")}
					onOtpChange={setOtpCode}
					onCopy={copyToClipboard}
				/>
			)}

			<ChangePasswordCard
				passwords={passwords}
				loading={loading}
				onChange={(field, value) => setPasswords((prev) => ({ ...prev, [field]: value }))}
				onSubmit={handlePasswordChange}
			/>

			<hr className="border-gray-100" />

			<LoginHistoryTable logs={loginHistoryLogs} />

			<hr className="border-gray-100" />

			<DangerZoneCard />
		</div>
	);
}
