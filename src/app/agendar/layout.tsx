import { Metadata } from "next";
import { getCategoryDynamicMetadata } from "@/lib/seo-metadata";

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return getCategoryDynamicMetadata({
    category: "gestante",
    title: "Agendamento Online | Hellen Ferreira Fotografia",
    description: "Escolha a melhor data e horário e agende seu ensaio fotográfico de forma simples e rápida.",
    path: "/agendar",
  });
}

export default function AgendarLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
