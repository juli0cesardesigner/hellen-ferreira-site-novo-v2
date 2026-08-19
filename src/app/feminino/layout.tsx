import { Metadata } from "next";
import { getCategoryDynamicMetadata } from "@/lib/seo-metadata";

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return getCategoryDynamicMetadata({
    category: "feminino",
    title: "Ensaio Feminino | Hellen Ferreira Fotografia",
    description: "Retratos autênticos que valorizam a sua essência, autoestima e feminilidade.",
    path: "/feminino",
  });
}

export default function FemininoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
