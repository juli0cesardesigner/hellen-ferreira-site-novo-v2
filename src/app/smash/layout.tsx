import { Metadata } from "next";
import { getCategoryDynamicMetadata } from "@/lib/seo-metadata";

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return getCategoryDynamicMetadata({
    category: "smash-the-cake",
    title: "Ensaio Smash the Cake | Hellen Ferreira Fotografia",
    description: "Comemore o primeiro aninho com um ensaio alegre, divertido e muito doce!",
    path: "/smash",
  });
}

export default function SmashLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
