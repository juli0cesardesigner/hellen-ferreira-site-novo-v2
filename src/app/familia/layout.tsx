import { Metadata } from "next";
import { getCategoryDynamicMetadata } from "@/lib/seo-metadata";

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return getCategoryDynamicMetadata({
    category: "familia",
    title: "Ensaio de Família | Hellen Ferreira Fotografia",
    description: "Capture o amor, a união e os laços afetivos em um ensaio fotográfico de família inesquecível.",
    path: "/familia",
  });
}

export default function FamiliaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
