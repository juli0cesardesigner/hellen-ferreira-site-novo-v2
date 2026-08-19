import { Metadata } from "next";
import { getCategoryDynamicMetadata } from "@/lib/seo-metadata";

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return getCategoryDynamicMetadata({
    category: "newborn-menino",
    title: "Ensaio Newborn Menino | Hellen Ferreira Fotografia",
    description: "Sensibilidade e arte para eternizar os primeiros dias do seu menininho com total conforto e segurança.",
    path: "/newborn-menino",
  });
}

export default function NewbornMeninoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
