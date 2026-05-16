import { redirect } from "next/navigation";

/**
 * /agendar without query params → redirect to /servicos so the user picks a service first.
 * The middleware already handles /agendar?sessao=ID → /agendar/[slug] redirects.
 */
export default function AgendarPage() {
  redirect("/ensaios");
}
