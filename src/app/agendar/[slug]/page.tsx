import { fetchSessionBySlug } from "@/lib/actions/booking-actions";
import { notFound } from "next/navigation";
import BookingWizard from "@/components/booking/BookingWizard";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tier?: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { session } = await fetchSessionBySlug(slug);

  if (!session) {
    return {
      title: "Serviço não encontrado | Hellen Ferreira",
    };
  }

  return {
    title: `Agendar ${session.name} | Hellen Ferreira`,
    description: `Agende agora sua sessão de ${session.name} com Hellen Ferreira. Garanta sua data com facilidade e segurança.`,
    alternates: {
      canonical: `https://www.hellenferreira.com.br/agendar/${slug}`,
    }
  };
}

export default async function AgendarSlugPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { tier } = await searchParams;
  
  const { session } = await fetchSessionBySlug(slug);
  
  if (!session) {
    notFound();
  }

  const initialTier = tier ? parseInt(tier) : 1;

  return <BookingWizard initialSessionId={session.id} initialTier={initialTier} />;
}
