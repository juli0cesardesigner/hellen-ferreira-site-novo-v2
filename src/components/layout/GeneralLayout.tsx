"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AdminBottomNav } from "@/components/layout/BottomNav";
import { WhatsAppWidget } from "@/components/ui/WhatsAppWidget";
import { ToastProvider } from "@/components/ui/Toast";

export function GeneralLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return (
      <ToastProvider>
        <main className="flex-grow">{children}</main>
        <AdminBottomNav />
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <Navbar />
      <main className="flex-grow pt-20">
        {children}
      </main>
      <Footer />
      <WhatsAppWidget />
    </ToastProvider>
  );
}
