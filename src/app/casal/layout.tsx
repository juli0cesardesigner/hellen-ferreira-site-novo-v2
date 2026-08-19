import { Metadata } from "next";
import { getCategoryDynamicMetadata } from "@/lib/seo-metadata";

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return getCategoryDynamicMetadata({
    category: "casal",
    title: "Ensaio de Casal | Hellen Ferreira Fotografia",
    description: "Celebre o amor e a sintonia do casal com fotos espontâneas, românticas e atemporais.",
    path: "/casal",
  });
}

export default function CasalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
