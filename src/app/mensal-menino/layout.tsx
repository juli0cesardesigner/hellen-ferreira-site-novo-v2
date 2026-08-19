import { Metadata } from "next";
import { getCategoryDynamicMetadata } from "@/lib/seo-metadata";

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return getCategoryDynamicMetadata({
    category: "mensal-menino",
    title: "Acompanhamento Mensal Menino | Hellen Ferreira Fotografia",
    description: "Registre cada fase do desenvolvimento do seu filho durante o primeiro ano de vida.",
    path: "/mensal-menino",
  });
}

export default function MensalMeninoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
