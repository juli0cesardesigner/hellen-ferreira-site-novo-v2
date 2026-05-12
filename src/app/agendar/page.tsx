"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import BookingWizard from "@/components/booking/BookingWizard";

function BookingWizardWrapper() {
  const searchParams = useSearchParams();
  const tier = parseInt(searchParams.get('tier') || '1');
  const sessionId = searchParams.get('sessao') || "be68f0ac-d486-4cad-8ea4-3eed090ffada";

  return <BookingWizard initialSessionId={sessionId} initialTier={tier} />;
}

export default function AgendarPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F5F1EE] flex items-center justify-center font-serif italic text-text-light">Carregando a melhor agenda...</div>}>
      <BookingWizardWrapper />
    </Suspense>
  );
}
