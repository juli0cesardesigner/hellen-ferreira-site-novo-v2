import { Metadata } from "next";
import { getCategoryDynamicMetadata } from "@/lib/seo-metadata";

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return getCategoryDynamicMetadata({
    category: "gestante",
    title: "Nossos Ensaios | Hellen Ferreira Fotografia",
    description: "Conheça nossas opções de ensaios fotográficos: Gestante, Newborn, Família, Smash the Cake e mais.",
    path: "/ensaios",
  });
}

export default function EnsaiosLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
