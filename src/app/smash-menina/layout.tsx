import { Metadata } from "next";
import { getCategoryDynamicMetadata } from "@/lib/seo-metadata";

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return getCategoryDynamicMetadata({
    category: "smash-menina",
    title: "Ensaio Smash the Cake Menina | Hellen Ferreira Fotografia",
    description: "Celebre o primeiro aninho da sua menina com um ensaio Smash the Cake doce, delicado e inesquecível.",
    path: "/smash-menina",
  });
}

export default function SmashMeninaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
