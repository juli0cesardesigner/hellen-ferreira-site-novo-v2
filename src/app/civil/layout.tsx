import { Metadata } from "next";
import { getCategoryDynamicMetadata } from "@/lib/seo-metadata";

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return getCategoryDynamicMetadata({
    category: "civil",
    title: "Casamento Civil | Hellen Ferreira Fotografia",
    description: "Registros emocionantes da sua cerimônia de casamento civil com olhar sensível e atemporal.",
    path: "/civil",
  });
}

export default function CivilLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
