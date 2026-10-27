import { Aside } from "@/components/layout/aside";
import { Topbar } from "@/components/layout/topbar";
import { SuperAdminGate } from "@/components/layout/superadmin-gate";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SuperAdminGate>
    <div className="w-screen h-screen flex flex-row bg-white overflow-hidden">
      <Aside />
      <div className="flex-1 flex flex-col h-full overflow-hidden relative transition-all duration-200 bg-white" style={{ zIndex: 10 }}>
        <Topbar />
        <main className="w-full overflow-y-auto custom-scrollbar bg-white relative p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
    </SuperAdminGate>
  );
}
