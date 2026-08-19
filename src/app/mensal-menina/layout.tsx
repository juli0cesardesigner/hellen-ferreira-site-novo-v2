import { Metadata } from "next";
import { getCategoryDynamicMetadata } from "@/lib/seo-metadata";

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return getCategoryDynamicMetadata({
    category: "mensal-menina",
    title: "Acompanhamento Mensal Menina | Hellen Ferreira Fotografia",
    description: "Acompanhe mês a mês o crescimento da sua bebê com cenários encantadores.",
    path: "/mensal-menina",
  });
}

export default function MensalMeninaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
