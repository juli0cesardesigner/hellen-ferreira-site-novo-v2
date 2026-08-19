import { Metadata } from "next";
import { getCategoryDynamicMetadata } from "@/lib/seo-metadata";

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return getCategoryDynamicMetadata({
    category: "revelacao",
    title: "Ensaio Chá Revelação | Hellen Ferreira Fotografia",
    description: "Guarde para sempre a emoção e a surpresa da descoberta do sexo do seu bebê.",
    path: "/revelacao",
  });
}

export default function RevelacaoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
