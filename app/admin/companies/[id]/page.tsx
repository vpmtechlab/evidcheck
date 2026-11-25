"use client";

import { getSessionToken } from "@/lib/session-token";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { getErrorMessage } from "@/lib/utils";
import { CompanyHeader } from "./components/company-header";
import { CompanyStats } from "./components/company-stats";
import { CompanyUsersTab } from "./components/company-users-tab";
import { CompanyEditTab, type CompanyFormValues } from "./components/company-edit-tab";

const EMPTY_FORM: CompanyFormValues = {
	name: "",
	domain: "",
	status: "active",
	country: "",
	location: "",
	supportEmail: "",
};

export default function CompanyDetailsPage() {
	const params = useParams();
	const router = useRouter();
	const id = params.id as Id<"companies">;

	const company = useQuery(api.admin.getCompanyById, { sessionToken: getSessionToken() ?? "", companyId: id });
	const users = useQuery(api.admin.getCompanyUsers, { sessionToken: getSessionToken() ?? "", companyId: id });
	const updateCompany = useMutation(api.admin.updateCompany);

	const [form, setForm] = useState<CompanyFormValues>(EMPTY_FORM);
	const [isSaving, setIsSaving] = useState(false);

	// Hydrate the form once per loaded company (deferred to avoid render cascades)
	const hydratedFor = useRef<string | null>(null);
	useEffect(() => {
		if (!company || hydratedFor.current === company._id) return;
		hydratedFor.current = company._id;
		const snapshot: CompanyFormValues = {
			name: company.name,
			domain: company.domain,
			status: company.status,
			country: company.country,
			location: company.location,
			supportEmail: company.support_email,
		};
		const timer = setTimeout(() => setForm(snapshot), 0);
		return () => clearTimeout(timer);
	}, [company]);

	const handleUpdate = async () => {
		setIsSaving(true);
		try {
			await updateCompany({
				sessionToken: getSessionToken() ?? "",
				companyId: id,
				name: form.name,
				domain: form.domain,
				status: form.status,
				country: form.country,
				location: form.location,
				support_email: form.supportEmail,
			});
			toast.success("Organization updated successfully!");
		} catch (error) {
			toast.error(getErrorMessage(error));
			console.error(error);
		} finally {
			setIsSaving(false);
		}
	};

	if (company === undefined) {
		return (
			<div className="flex justify-center items-center h-64">
				<Loader2 className="w-8 h-8 animate-spin text-brand" />
			</div>
		);
	}

	if (company === null) {
		return (
			<div className="p-8 text-center bg-white border border-gray-200 rounded-lg shadow-2xs space-y-3">
				<h1 className="text-base font-bold text-gray-900">Organization Not Found</h1>
				<p className="text-xs text-gray-500">The company you&apos;re looking for doesn&apos;t exist or has been removed.</p>
				<Button
					size="sm"
					className="text-xs rounded-md bg-brand hover:bg-brand-dark text-white"
					onClick={() => router.push("/admin/companies")}
				>
					Back to Organizations
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<CompanyHeader
				name={company.name}
				domain={company.domain}
				onBack={() => router.push("/admin/companies")}
			/>

			<CompanyStats company={company} />

			<div className="bg-white border border-gray-200 rounded-lg shadow-2xs overflow-hidden flex flex-col">
				<Tabs defaultValue="users" className="flex-1 flex flex-col">
					<div className="px-5 border-b border-gray-200 bg-gray-50/50">
						<TabsList className="bg-transparent h-auto p-0 gap-6">
							<TabsTrigger
								value="users"
								className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 px-1 text-xs font-bold text-gray-600 data-[state=active]:text-brand"
							>
								Users & Roles ({users?.length || 0})
							</TabsTrigger>
							<TabsTrigger
								value="edit"
								className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 px-1 text-xs font-bold text-gray-600 data-[state=active]:text-brand"
							>
								Edit Details
							</TabsTrigger>
						</TabsList>
					</div>

					<div className="flex-1 p-5">
						<TabsContent value="users" className="mt-0 outline-none">
							<CompanyUsersTab users={users} />
						</TabsContent>

						<TabsContent value="edit" className="mt-0 outline-none max-w-3xl">
							<CompanyEditTab
								values={form}
								isSaving={isSaving}
								onChange={(field, value) => setForm((prev) => ({ ...prev, [field]: value }))}
								onCancel={() => router.push("/admin/companies")}
								onSave={handleUpdate}
							/>
						</TabsContent>
					</div>
				</Tabs>
			</div>
		</div>
	);
}
