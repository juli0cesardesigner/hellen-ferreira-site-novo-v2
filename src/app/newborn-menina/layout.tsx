import { Metadata } from "next";
import { getCategoryDynamicMetadata } from "@/lib/seo-metadata";

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return getCategoryDynamicMetadata({
    category: "newborn-menina",
    title: "Ensaio Newborn Menina | Hellen Ferreira Fotografia",
    description: "Registros apaixonantes e seguros dos primeiros dias da sua menininha.",
    path: "/newborn-menina",
  });
}

export default function NewbornMeninaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
