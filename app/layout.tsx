import type { Metadata } from "next";
import { Urbanist } from "next/font/google";
import { AppProvider } from "@/components/providers/app-provider";
import { ConvexClientProvider } from "@/components/providers/convex-client-provider";
import { Toaster } from "sonner";
import "./globals.css";

const urbanist = Urbanist({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EvidCheck",
  description: "Real-time KYB, KYB Verification",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${urbanist.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <ConvexClientProvider>
          <AppProvider>
            {children}
            <Toaster richColors position="top-right" />
          </AppProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
