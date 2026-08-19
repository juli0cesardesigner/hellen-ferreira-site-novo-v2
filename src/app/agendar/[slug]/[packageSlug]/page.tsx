import { fetchSessionBySlug } from "@/lib/actions/booking-actions";
import { notFound } from "next/navigation";
import BookingWizard from "@/components/booking/BookingWizard";
import { Metadata } from "next";
import { Package } from "@/types/database";
import { getCategoryDynamicMetadata } from "@/lib/seo-metadata";

interface PageProps {
  params: Promise<{ slug: string; packageSlug: string }>;
}

export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ slug: string; packageSlug: string }> }): Promise<Metadata> {
  const { slug, packageSlug } = await params;
  const { session } = await fetchSessionBySlug(slug);

  if (!session) {
    return { title: "Serviço não encontrado | Hellen Ferreira" };
  }

  const pkg = session.session_packages?.find((p: Package) => p.slug === packageSlug);
  const packageName = pkg ? pkg.name : "";

  return getCategoryDynamicMetadata({
    category: slug,
    title: `Agendar ${session.name} ${packageName} | Hellen Ferreira`,
    description: `Agende agora sua sessão de ${session.name} (${packageName}) com Hellen Ferreira.`,
    path: `/agendar/${slug}/${packageSlug}`,
  });
}

export default async function AgendarPackagePage({ params }: PageProps) {
  const { slug, packageSlug } = await params;
  
  const { session } = await fetchSessionBySlug(slug);
  
  if (!session) {
    notFound();
  }

  const pkg = session.session_packages?.find((p: Package) => p.slug === packageSlug);
  
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
