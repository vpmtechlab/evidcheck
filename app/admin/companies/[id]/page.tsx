"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  Loader2, 
  User, 
  Building2, 
  Mail, 
  Globe, 
  MapPin, 
  ArrowLeft,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { getErrorMessage } from "@/lib/utils";

export default function CompanyDetailsPage() {
	const params = useParams();
	const router = useRouter();
	const id = params.id as Id<"companies">;

	const company = useQuery(api.admin.getCompanyById, { companyId: id });
	const users = useQuery(api.admin.getCompanyUsers, { companyId: id });
	const updateCompany = useMutation(api.admin.updateCompany);

	const [name, setName] = useState("");
	const [domain, setDomain] = useState("");
	const [status, setStatus] = useState("");
	const [country, setCountry] = useState("");
	const [location, setLocation] = useState("");
	const [supportEmail, setSupportEmail] = useState("");
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		if (company) {
			setName(company.name);
			setDomain(company.domain);
			setStatus(company.status);
			setCountry(company.country);
			setLocation(company.location);
			setSupportEmail(company.support_email);
		}
	}, [company]);

	const handleUpdate = async () => {
		setIsSaving(true);
		try {
			await updateCompany({
				companyId: id,
				name,
				domain,
				status,
				country,
				location,
				support_email: supportEmail,
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
				<Loader2 className="w-8 h-8 animate-spin text-[#188015]" />
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
					className="text-xs rounded-md bg-[#188015] hover:bg-[#136610] text-white" 
					onClick={() => router.push("/admin/companies")}
				>
					Back to Organizations
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Breadcrumbs & Header */}
			<div className="space-y-3 pb-4 border-b border-gray-200">
				<div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
					<Link href="/admin/companies" className="hover:text-[#188015] transition-colors">Organizations</Link>
					<ChevronRight className="w-3.5 h-3.5 text-gray-400" />
					<span className="text-gray-900 font-bold">{company.name}</span>
				</div>
				
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 bg-[#0e1b42] text-white rounded-md flex items-center justify-center font-bold">
							<Building2 className="w-5 h-5" />
						</div>
						<div>
							<h1 className="text-xl font-bold text-gray-900 tracking-tight">{company.name}</h1>
							<p className="text-gray-500 flex items-center gap-1 text-xs mt-0.5 font-mono">
								<Globe className="w-3 h-3 text-gray-400" /> {company.domain}
							</p>
						</div>
					</div>
					<Button 
						variant="outline" 
						size="sm" 
						className="gap-1.5 text-xs font-semibold rounded-md border-gray-300 self-start sm:self-auto h-8 text-gray-700 hover:bg-gray-50" 
						onClick={() => router.push("/admin/companies")}
					>
						<ArrowLeft className="w-3.5 h-3.5" /> Back to List
					</Button>
				</div>
			</div>

			{/* Stats Overview */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				<div className="bg-white p-4 rounded-lg border border-gray-200 shadow-2xs space-y-1">
					<p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Wallet Balance</p>
					<p className="text-2xl font-bold text-[#188015] font-mono">${company.availableBalance.toFixed(2)}</p>
				</div>
				<div className="bg-white p-4 rounded-lg border border-gray-200 shadow-2xs space-y-1">
					<p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Users</p>
					<p className="text-2xl font-bold text-gray-900 font-mono">{company.userCount}</p>
				</div>
				<div className="bg-white p-4 rounded-lg border border-gray-200 shadow-2xs space-y-1">
					<p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Verifications</p>
					<p className="text-2xl font-bold text-gray-900 font-mono">{company.verificationCount}</p>
				</div>
				<div className="bg-white p-4 rounded-lg border border-gray-200 shadow-2xs space-y-1">
					<p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Joined Date</p>
					<p className="text-2xl font-bold text-gray-900 font-mono">{new Date(company.createdAt).toLocaleDateString()}</p>
				</div>
			</div>

			{/* Main Content Tabs */}
			<div className="bg-white border border-gray-200 rounded-lg shadow-2xs overflow-hidden flex flex-col">
				<Tabs defaultValue="users" className="flex-1 flex flex-col">
					<div className="px-5 border-b border-gray-200 bg-gray-50/50">
						<TabsList className="bg-transparent h-auto p-0 gap-6">
							<TabsTrigger
								value="users"
								className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#188015] data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 px-1 text-xs font-bold text-gray-600 data-[state=active]:text-[#188015]"
							>
								Users & Roles ({users?.length || 0})
							</TabsTrigger>
							<TabsTrigger
								value="edit"
								className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#188015] data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 px-1 text-xs font-bold text-gray-600 data-[state=active]:text-[#188015]"
							>
								Edit Details
							</TabsTrigger>
						</TabsList>
					</div>

					<div className="flex-1 p-5">
						<TabsContent value="users" className="mt-0 outline-none">
							{users === undefined ? (
								<div className="flex justify-center py-12">
									<Loader2 className="w-8 h-8 animate-spin text-[#188015]" />
								</div>
							) : users.length === 0 ? (
								<div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
									<User className="w-10 h-10 text-gray-300 mx-auto mb-2" />
									<h3 className="text-xs font-bold text-gray-900">No users found</h3>
									<p className="text-gray-500 text-[11px]">There are no team members registered under this organization.</p>
								</div>
							) : (
								<div className="border border-gray-200 rounded-lg overflow-hidden">
									<Table>
										<TableHeader className="bg-gray-50/80 border-b border-gray-200">
											<TableRow>
												<TableHead className="font-bold text-xs text-gray-700 uppercase tracking-wider py-2.5">Name</TableHead>
												<TableHead className="font-bold text-xs text-gray-700 uppercase tracking-wider py-2.5">Email Address</TableHead>
												<TableHead className="font-bold text-xs text-gray-700 uppercase tracking-wider py-2.5">Role</TableHead>
												<TableHead className="font-bold text-xs text-gray-700 uppercase tracking-wider py-2.5">Status</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{users.map((user) => (
												<TableRow key={user._id} className="hover:bg-gray-50/40 transition-colors border-b border-gray-100">
													<TableCell className="font-bold text-xs text-gray-900 py-3">
														{user.firstName} {user.surname}
													</TableCell>
													<TableCell className="text-gray-600 font-mono text-xs py-3">{user.email}</TableCell>
													<TableCell className="py-3">
														<span className="inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
															{user.role}
														</span>
													</TableCell>
													<TableCell className="py-3">
														<span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider border
															${user.status === "active" ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-100 text-gray-700 border-gray-200"}`}
														>
															{user.status}
														</span>
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</div>
							)}
						</TabsContent>

						<TabsContent value="edit" className="mt-0 outline-none max-w-3xl">
							<div className="space-y-6">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-1.5">
										<Label htmlFor="comp-name" className="text-xs font-bold text-gray-700">Organization Name</Label>
										<div className="relative">
											<Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
											<Input
												id="comp-name"
												className="pl-9 h-9 text-xs rounded-md border-gray-300"
												value={name}
												onChange={(e) => setName(e.target.value)}
												required
											/>
										</div>
									</div>
									<div className="space-y-1.5">
										<Label htmlFor="comp-domain" className="text-xs font-bold text-gray-700">Domain Registry</Label>
										<div className="relative">
											<Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
											<Input
												id="comp-domain"
												className="pl-9 h-9 text-xs font-mono rounded-md border-gray-300"
												value={domain}
												onChange={(e) => setDomain(e.target.value)}
												required
											/>
										</div>
									</div>
									<div className="space-y-1.5">
										<Label htmlFor="comp-email" className="text-xs font-bold text-gray-700">Technical Support Email</Label>
										<div className="relative">
											<Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
											<Input
												id="comp-email"
												type="email"
												className="pl-9 h-9 text-xs font-mono rounded-md border-gray-300"
												value={supportEmail}
												onChange={(e) => setSupportEmail(e.target.value)}
												required
											/>
										</div>
									</div>
									<div className="space-y-1.5">
										<Label htmlFor="comp-status" className="text-xs font-bold text-gray-700">Operational Status</Label>
										<select
											id="comp-status"
											className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs focus-visible:outline-none focus:ring-1 focus:ring-gray-400"
											value={status}
											onChange={(e) => setStatus(e.target.value)}
										>
											<option value="active">Active & Operational</option>
											<option value="inactive">Locked / Inactive</option>
										</select>
									</div>
									<div className="space-y-1.5">
										<Label htmlFor="comp-country" className="text-xs font-bold text-gray-700">Registration Country</Label>
										<Input
											id="comp-country"
											className="h-9 text-xs rounded-md border-gray-300"
											value={country}
											onChange={(e) => setCountry(e.target.value)}
											required
										/>
									</div>
									<div className="space-y-1.5">
										<Label htmlFor="comp-location" className="text-xs font-bold text-gray-700">Office Location</Label>
										<div className="relative">
											<MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
											<Input
												id="comp-location"
												className="pl-9 h-9 text-xs rounded-md border-gray-300"
												value={location}
												onChange={(e) => setLocation(e.target.value)}
												required
											/>
										</div>
									</div>
								</div>

								<div className="pt-4 border-t border-gray-100 flex justify-end gap-2.5">
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={() => router.push("/admin/companies")}
										disabled={isSaving}
										className="h-8 px-4 text-xs font-semibold rounded-md border-gray-300"
									>
										Cancel
									</Button>
									<Button 
										onClick={handleUpdate} 
										disabled={isSaving} 
										size="sm"
										className="gap-1.5 h-8 px-4 text-xs font-semibold rounded-md bg-[#188015] hover:bg-[#136610] text-white shadow-xs"
									>
										{isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
										Save Organization Profile
									</Button>
								</div>
							</div>
						</TabsContent>
					</div>
				</Tabs>
			</div>
		</div>
	);
}
