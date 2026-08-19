import { Metadata } from "next";
import { getCategoryDynamicMetadata } from "@/lib/seo-metadata";

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return getCategoryDynamicMetadata({
    category: "corporativo",
    title: "Ensaio Corporativo | Hellen Ferreira Fotografia",
    description: "Posicione sua imagem profissional com autoridade, elegância e elegância empresarial.",
    path: "/corporativo",
  });
}

export default function CorporativoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
