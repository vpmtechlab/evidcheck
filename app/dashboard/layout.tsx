import { Aside } from "@/components/layout/aside";
import { Topbar } from "@/components/layout/topbar";
import { AppTour } from "@/components/dashboard/app-tour";
import Script from "next/script";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-screen h-screen flex flex-row bg-white overflow-hidden">
      <Script src="https://js.paystack.co/v1/inline.js" strategy="lazyOnload" />
      <Aside />
      <div className="flex-1 flex flex-col h-full overflow-hidden relative transition-all duration-200 bg-white" style={{ zIndex: 10 }}>
        <Topbar />
        <main className="w-full flex-1 overflow-y-auto custom-scrollbar bg-white relative p-4 md:p-6">
          {children}
        </main>
      </div>
      <AppTour />
    </div>
  );
}
