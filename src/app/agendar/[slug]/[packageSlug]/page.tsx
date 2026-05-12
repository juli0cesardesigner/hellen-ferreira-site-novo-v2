import { fetchSessionBySlug } from "@/lib/actions/booking-actions";
import { notFound } from "next/navigation";
import BookingWizard from "@/components/booking/BookingWizard";
import { Metadata } from "next";
import { getSessionBySlug, getPackageBySlug } from "@/lib/data/sessions";

interface PageProps {
  params: Promise<{ slug: string; packageSlug: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; packageSlug: string }> }): Promise<Metadata> {
  const { slug, packageSlug } = await params;
  const session = getSessionBySlug(slug);

  if (!session) {
    return { title: "Serviço não encontrado | Hellen Ferreira" };
  }

  const pkg = getPackageBySlug(session, packageSlug);
  const packageName = pkg ? pkg.name : "";

  return {
    title: `Agendar ${session.name} ${packageName} | Hellen Ferreira`,
    description: `Agende agora sua sessão de ${session.name} (${packageName}) com Hellen Ferreira.`,
    alternates: {
      canonical: `https://www.hellenferreira.com.br/agendar/${slug}/${packageSlug}`,
    }
  };
}

export default async function AgendarPackagePage({ params }: PageProps) {
  const { slug, packageSlug } = await params;
  
  const session = getSessionBySlug(slug);
  
  if (!session) {
    notFound();
  }

  const pkg = getPackageBySlug(session, packageSlug);
  
  if (!pkg) {
    // Se o slug do pacote não existir, podemos ou dar 404 ou redirecionar para o padrão
    notFound();
  }

  return (
    <BookingWizard 
      initialSessionId={session.id} 
      initialTier={pkg.tier_order} 
    />
  );
}
