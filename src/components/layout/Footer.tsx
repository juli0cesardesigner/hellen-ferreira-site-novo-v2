import Link from "next/link";
import Image from "next/image";
import { SITE_CONFIG } from "@/lib/constants";

export function Footer() {
  return (
    <footer 
      style={{ paddingTop: 'var(--spacing-section-v)', paddingBottom: 'var(--spacing-section-v)' }}
      className="bg-linen border-t border-sand"
    >
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-24 items-start">
          <div className="space-y-6">
            <Link href="/" className="inline-block transition-opacity hover:opacity-80">
              <Image 
                src="/brand/logo.svg" 
                alt="Hellen Ferreira" 
                width={150}
                height={48}
                className="h-12 w-auto"
              />
            </Link>
            <p className="text-text-light text-sm italic font-serif">
              Registrando legados através de fotografia fine-art.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-[0.2em] text-text-dark font-semibold">Navegação</h4>
            <ul className="space-y-2 text-sm text-text-medium">
              <li><Link href={SITE_CONFIG.links.services} className="hover:text-blush transition-colors">Sessões</Link></li>
              <li><Link href={SITE_CONFIG.links.about} className="hover:text-blush transition-colors">Sobre Mim</Link></li>
              {/* <li><Link href={SITE_CONFIG.links.booking} className="hover:text-blush transition-colors">Agendar</Link></li> */}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-[0.2em] text-text-dark font-semibold">Contato</h4>
            <div className="text-sm text-text-medium space-y-4">
              <div className="space-y-1">
                <p>{SITE_CONFIG.contact.email}</p>
                <p>{SITE_CONFIG.contact.phone}</p>
              </div>
              <p className="text-[11px] leading-relaxed opacity-80">
                {SITE_CONFIG.contact.address} <br />
                <span className="italic">{SITE_CONFIG.contact.addressReference}</span>
              </p>
              <div className="pt-2 flex gap-4">
                <a href={SITE_CONFIG.social.instagram} target="_blank" rel="noopener noreferrer" className="text-text-light hover:text-blush transition-colors">Instagram</a>
                <a href={SITE_CONFIG.social.whatsappLink} target="_blank" rel="noopener noreferrer" className="text-text-light hover:text-blush transition-colors">WhatsApp</a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-sand/50 flex flex-col items-center gap-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-text-light text-center">
            © {new Date().getFullYear()} {SITE_CONFIG.name}. Todos os direitos reservados.
          </p>
          <p className="text-[9px] tracking-[0.1em] text-text-light opacity-60">
            CNPJ: {SITE_CONFIG.cnpj}
          </p>
        </div>
      </div>
    </footer>
  );
}
