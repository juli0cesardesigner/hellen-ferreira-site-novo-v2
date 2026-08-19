import { fetchSessionBySlug } from "@/lib/actions/booking-actions";
import { notFound, redirect } from "next/navigation";
import BookingWizard from "@/components/booking/BookingWizard";
import { Metadata } from "next";
import { Package } from "@/types/database";
import { getCategoryDynamicMetadata } from "@/lib/seo-metadata";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tier?: string }>;
}

export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { session } = await fetchSessionBySlug(slug);

  if (!session) {
    return {
      title: "Serviço não encontrado | Hellen Ferreira",
    };
  }

  return getCategoryDynamicMetadata({
    category: slug,
    title: `Agendar ${session.name} | Hellen Ferreira`,
    description: `Agende agora sua sessão de ${session.name} com Hellen Ferreira. Garanta sua data com facilidade e segurança.`,
    path: `/agendar/${slug}`,
  });
}

export default async function AgendarSlugPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { tier } = await searchParams;
  
  const { session } = await fetchSessionBySlug(slug);
  
  if (!session) {
    notFound();
  }

  // Se o tier for fornecido via query param, redirecionamos para a URL profissional
  if (tier) {
    const tierNum = parseInt(tier);
    const pkg = session.session_packages?.find((p: Package) => p.tier_order === tierNum);
    if (pkg) {
      redirect(`/agendar/${slug}/${pkg.slug}`);
    }
  }

  // Caso padrão (ex: /agendar/gestante sem tier)
  // Pode mostrar o primeiro pacote ou o wizard padrão
  return <BookingWizard initialSessionId={session.id} initialTier={1} />;
}
