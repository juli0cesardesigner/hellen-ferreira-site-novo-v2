import { Metadata } from "next";
import { getCategoryDynamicMetadata } from "@/lib/seo-metadata";

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return getCategoryDynamicMetadata({
    category: "smash-menino",
    title: "Ensaio Smash the Cake Menino | Hellen Ferreira Fotografia",
    description: "Celebre o primeiro aninho do seu menino com um ensaio Smash the Cake doce, afetivo e inesquecível.",
    path: "/smash-menino",
  });
}

export default function SmashMeninoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
