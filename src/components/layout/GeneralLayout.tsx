"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppWidget } from "@/components/ui/WhatsAppWidget";
import { ToastProvider } from "@/components/ui/Toast";

export function GeneralLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return (
      <ToastProvider>
        <main className="flex-grow">{children}</main>
      </ToastProvider>
    );
  }

  const isNatal = pathname?.startsWith("/natal");

  return (
    <ToastProvider>
      {!isNatal && <Navbar />}
      <main className={`flex-grow ${isNatal ? "" : "pt-20"}`}>
        {children}
      </main>
      {!isNatal && <Footer />}
      {!isNatal && <WhatsAppWidget />}
    </ToastProvider>
  );
}
