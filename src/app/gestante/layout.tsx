import { Metadata } from "next";
import { getCategoryDynamicMetadata } from "@/lib/seo-metadata";

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return getCategoryDynamicMetadata({
    category: "gestante",
    title: "Ensaio Gestante | Hellen Ferreira Fotografia",
    description: "Eternize a magia e a beleza da sua gestação com ensaios fotográficos únicos e delicados.",
    path: "/gestante",
  });
}

export default function GestanteLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
