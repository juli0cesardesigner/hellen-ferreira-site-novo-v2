export interface SessionPackage {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  tier_order: number;
  price_digital: number;
  price_print: number;
  upgrade_label: string;
  features: string[] | null;
  is_active: boolean;
}

export interface Session {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  duration_slots: number;
  deposit_price: number;
  theme_color: string; // Hex color for the calendar view
  session_packages: SessionPackage[];
  is_perpetual?: boolean;
  start_date?: string | null;
  end_date?: string | null;
  setup_minutes?: number;   // Minutos de preparação antes da sessão
  cleanup_minutes?: number; // Minutos de limpeza/intervalo após a sessão
  min_notice_hours?: number | null; // Antecedência mínima em horas para reserva (sobrepõe regra geral)
}

export const SESSIONS_DATA: Record<string, Session> = {
  "1595bad4-1d33-4c39-9ca3-1ec2d1849962": {
    id: "1595bad4-1d33-4c39-9ca3-1ec2d1849962",
    name: "Civil",
    slug: "civil",
    is_active: true,
    duration_slots: 6,
    deposit_price: 100,
    theme_color: "#FFD700", // Gold (Civil)
    session_packages: [
      {
        id: "3d5af0a6-ebb2-4484-b9c5-c024c886baa5",
        name: "O Sim no Cartório",
        slug: "sim-no-cartorio",
        description: "Discreto e Intimista",
        tier_order: 1,
        price_digital: 400,
        price_print: 0,
        upgrade_label: "",
        features: ["Cobertura completa da cerimônia no cartório", "30 Fotos em alta resolução com tratamento artístico", "Galeria online privada para download"],
        is_active: true
      },
      {
        id: "2fd9d117-5b5a-4cf7-a596-10639aaced15",
        name: "O Sim e a Celebração",
        slug: "sim-e-celebracao",
        description: "Sessão completa e romântica",
        tier_order: 2,
        price_digital: 500,
        price_print: 0,
        upgrade_label: "",
        features: ["Cobertura completa da cerimônia no cartório", "Mini ensaio externo para o casal (até 1h)", "50 Fotos no total com tratamento artístico"],
        is_active: true
      }
    ]
  },
  "50674a5b-ad94-442b-b4d1-328f4d7f59db": {
    id: "50674a5b-ad94-442b-b4d1-328f4d7f59db",
    name: "Revelação",
    slug: "revelacao",
    is_active: true,
    duration_slots: 1,
    deposit_price: 50,
    theme_color: "#800080", // Deep Purple (Revelação)
    session_packages: [
      {
        id: "c669452f-7f1e-4b03-b9d7-b1259bd8839e",
        name: "Revelação",
        slug: "revelacao",
        description: "Momentos de surpresa eterna",
        tier_order: 1,
        price_digital: 450,
        price_print: 525,
        upgrade_label: "Digital + Impressões 15x20",
        features: ["15 Fotos em alta resolução", "Sessão em estúdio ou externa", "Entrega via galeria online"],
        is_active: true
      }
    ]
  },
  "6d560dc9-e87d-45c1-8cbf-e26edc72a2f2": {
    id: "6d560dc9-e87d-45c1-8cbf-e26edc72a2f2",
    name: "Smash the Cake",
    slug: "smash-the-cake",
    is_active: true,
    duration_slots: 1,
    deposit_price: 100,
    theme_color: "#00E5FF", // Electric Cyan (Smash)
    session_packages: [
      {
        id: "b5220708-4c6c-4e29-87ae-44d7f400eaa0",
        name: "Smash the Cake",
        slug: "smash",
        description: "Primeiro aninho com festa",
        tier_order: 1,
        price_digital: 450,
        price_print: 500,
        upgrade_label: "Digital + Impressão 15x20",
        features: ["15 Fotos em alta resolução", "Cenário minimalista com bolo neutro", "Fotos com pais e irmãos inclusas", "Entrega via galeria online"],
        is_active: true
      }
    ]
  },
  "7024263c-2f3e-4c7f-a66f-cf04e2bd069a": {
    id: "7024263c-2f3e-4c7f-a66f-cf04e2bd069a",
    name: "Feminino",
    slug: "feminino",
    is_active: true,
    duration_slots: 1,
    deposit_price: 100,
    theme_color: "#FF4D4D", // Vivid Red/Coral (Feminino)
    session_packages: [
      {
        id: "3ba22e7d-4fdf-4e1c-9116-dedff0fac862",
        name: "Retrato Essencial",
        slug: "essencial",
        description: "Elegância e Autenticidade",
        tier_order: 1,
        price_digital: 450,
        price_print: 525,
        upgrade_label: "Digital + Impressões 15x21",
        features: ["15 Fotos em alta resolução", "Foco em retratos impactantes em estúdio", "Troca de até 2 looks", "Arquivo Digital entregue via galeria"],
        is_active: true
      },
      {
        id: "43509cfc-0c51-446b-9d05-0b4fa21243ba",
        name: "Celebração",
        slug: "celebracao",
        description: "Sua história, seu legado",
        tier_order: 2,
        price_digital: 560,
        price_print: 685,
        upgrade_label: "Digital + Impressões 15x21",
        features: ["25 Fotos em alta resolução", "Estúdio ou Locação Externa", "Consultoria completa de estilo", "Arquivo Digital entregue via galeria"],
        is_active: true
      }
    ]
  },
  "70b4d4e6-72b5-4262-890c-cf0730e0db8e": {
    id: "70b4d4e6-72b5-4262-890c-cf0730e0db8e",
    name: "Família",
    slug: "familia",
    is_active: true,
    duration_slots: 1,
    deposit_price: 150,
    theme_color: "#008844", // Forest Green
    session_packages: [
      {
        id: "456a321d-3c25-43e4-8055-1f8a946f29c6",
        name: "Família",
        slug: "familia",
        description: "Momentos especiais juntos",
        tier_order: 1,
        price_digital: 400,
        price_print: 0,
        upgrade_label: "",
        features: ["15 Fotos em alta resolução (tratadas)", "Fotos da família toda inclusas", "Retratos individuais da(s) criança(s)", "Sessão em estúdio ou externa", "Entrega via galeria online"],
        is_active: true
      }
    ]
  },
  "a232eb5e-1583-4fb7-82da-84008e37f1b4": {
    id: "a232eb5e-1583-4fb7-82da-84008e37f1b4",
    name: "Newborn",
    slug: "newborn",
    is_active: true,
    duration_slots: 2,
    deposit_price: 200,
    theme_color: "#FF69B4", // Hot Pink (Newborn)
    session_packages: [
      {
        id: "77ce2962-6bb0-442e-8fb2-d8e300da99fe",
        name: "Baby",
        slug: "baby",
        description: "Foco exclusivo no bebê",
        tier_order: 1,
        price_digital: 450,
        price_print: 525,
        upgrade_label: "Digital + Impressões 15x20",
        features: ["15 Fotos (somente o Baby)", "2 cenários neutros", "Acessórios e Roupas inclusos", "Tempo para amamentação/pausas", "Arquivo Digital via galeria"],
        is_active: true
      },
      {
        id: "cbaea88f-1476-4ab4-ab68-abd8552338eb",
        name: "Família",
        slug: "familia",
        description: "Baby + Família",
        tier_order: 2,
        price_digital: 560,
        price_print: 680,
        upgrade_label: "Digital + Impressões 15x20",
        features: ["25 Fotos (Baby + Família)", "1 cenário neutro + Ensaio Free Style", "Acessórios e Roupas do Baby inclusos", "Arquivo Digital via galeria"],
        is_active: true
      }
    ]
  },
  "a67d857c-72ea-441a-9761-1e809bd1bf13": {
    id: "a67d857c-72ea-441a-9761-1e809bd1bf13",
    name: "Mensal",
    slug: "mensal",
    is_active: true,
    duration_slots: 1,
    deposit_price: 50,
    theme_color: "#0000FF", // Pure Blue (Acompanhamento)
    session_packages: [
      {
        id: "011b3835-0cd2-406a-b3a0-75e5a52b93d2",
        name: "Plano Mensal",
        slug: "mensal",
        description: "Evolução registrada com delicadeza",
        tier_order: 1,
        price_digital: 150,
        price_print: 180,
        upgrade_label: "Digital + Impressões 15x20",
        features: ["10 Fotos em alta resolução", "1 cenário minimalista", "Acessórios e Roupas inclusos", "Participação de Pais e Irmãos: adicional R$50", "Entrega digital mensal"],
        is_active: true
      }
    ]
  },
  "be68f0ac-d486-4cad-8ea4-3eed090ffada": {
    id: "be68f0ac-d486-4cad-8ea4-3eed090ffada",
    name: "Gestante",
    slug: "gestante",
    is_active: true,
    duration_slots: 1,
    deposit_price: 100,
    theme_color: "#007FFF", // Azure Blue (Gestante)
    session_packages: [
      {
        id: "f9a0b675-35b0-4465-a46c-a9d63e5a394a",
        name: "Ensaio Celebração",
        slug: "celebracao",
        description: "Leve e memorável",
        tier_order: 1,
        price_digital: 650,
        price_print: 750,
        upgrade_label: "Digital + Impressões 15x20",
        features: ["25 Fotos no Estúdio ou Externa", "2 trocas de roupa", "Adicional Look Extra - R$50", "Entrega em formato digital"],
        is_active: true
      },
      {
        id: "7a21e5f3-2374-407c-9a8b-ee93d06a190e",
        name: "Ensaio Legado",
        slug: "legado",
        description: "Sua história, seu legado",
        tier_order: 2,
        price_digital: 950,
        price_print: 1500,
        upgrade_label: "Digital + Álbum 20x20 + Caixa",
        features: ["45 Fotos no Estúdio ou Externa", "3 trocas de roupa", "Adicional Look Extra - R$50", "Álbum 20x20 (20 páginas) + Caixa inclusos", "Entrega via galeria exclusiva"],
        is_active: true
      }
    ]
  },
  "decd8b7e-1b04-498f-89ac-d846f37b2929": {
    id: "decd8b7e-1b04-498f-89ac-d846f37b2929",
    name: "Casal",
    slug: "casal",
    is_active: true,
    duration_slots: 1,
    deposit_price: 100,
    theme_color: "#FF4500", // Orange Red (Casal)
    session_packages: [
      {
        id: "9a309759-78a4-47bd-bca2-e07dbdafb074",
        name: "Encontro no Estúdio",
        slug: "encontro",
        description: "Leve e Intimista",
        tier_order: 1,
        price_digital: 350,
        price_print: 0,
        upgrade_label: "",
        features: ["10 Fotos em alta resolução (tratadas)", "Direção focada na intimidade e detalhes", "Ambiente controlado e privativo", "Entrega via galeria online"],
        is_active: true
      },
      {
        id: "999f17e1-efdf-4847-a3b1-5e61ed80c886",
        name: "Aventura a Dois",
        slug: "aventura",
        description: "Um dia inesquecível",
        tier_order: 2,
        price_digital: 500,
        price_print: 0,
        upgrade_label: "",
        features: ["20 Fotos em alta resolução (tratadas)", "Ensaio externo, sem taxas adicionais", "Mais tempo, mais variedade de fotos e momentos", "Consultoria para o destino"],
        is_active: true
      }
    ]
  },
  "dfe6e10c-0fa5-446d-873d-25c7e78b8bba": {
    id: "dfe6e10c-0fa5-446d-873d-25c7e78b8bba",
    name: "Corporativo",
    slug: "corporativo",
    is_active: true,
    duration_slots: 1,
    deposit_price: 100,
    theme_color: "#1A237E", // Dark Indigo (Corporativo)
    session_packages: [
      {
        id: "5439e4e2-1a3b-4ea9-a977-6c8e10ec464d",
        name: "Impacto",
        slug: "impacto",
        description: "Retratos profissionais",
        tier_order: 1,
        price_digital: 450,
        price_print: 0,
        upgrade_label: "",
        features: ["15 Fotos em alta resolução", "Fotos em estúdio com tratamento premium", "Foco em retratos para perfil", "Até 2 trocas de roupa"],
        is_active: true
      },
      {
        id: "c906f9ca-c303-4084-a8a3-13340e2ec45b",
        name: "Branding Pessoal",
        slug: "branding",
        description: "Apresentação de marca",
        tier_order: 2,
        price_digital: 560,
        price_print: 0,
        upgrade_label: "",
        features: ["25 Fotos em alta resolução", "Múltiplos fundos e cenários (estúdio ou sua empresa)", "Até 3 trocas de roupa", "Retratos e fotos de ação (você trabalhando)"],
        is_active: true
      }
    ]
  },
  "f7d1a2b3-c4d5-4e6f-a7b8-c9d0e1f2a3b4": {
    id: "f7d1a2b3-c4d5-4e6f-a7b8-c9d0e1f2a3b4",
    name: "Dia das Mães",
    slug: "dia-das-maes",
    is_active: true,
    duration_slots: 1,
    deposit_price: 100,
    theme_color: "#E91E63", // Hot Pink
    session_packages: [
      {
        id: "m0m-pkg-1",
        name: "Pacote Especial",
        slug: "especial",
        description: "Amor em cada clique",
        tier_order: 1,
        price_digital: 450,
        price_print: 500,
        upgrade_label: "Digital + Porta Retrato",
        features: ["15 Fotos digitais", "Cenário exclusivo de Dia das Mães", "Entrega via galeria online"],
        is_active: true
      }
    ]
  },
  "e7a1e0b2-3f4a-4b9e-9d2a-8b1e4c7d0a26": {
    id: "e7a1e0b2-3f4a-4b9e-9d2a-8b1e4c7d0a26",
    name: "Natal",
    slug: "natal",
    is_active: true,
    duration_slots: 3,
    deposit_price: 100,
    theme_color: "#C41E3A",
    is_perpetual: false,
    start_date: "2026-11-14",
    end_date: "2026-12-12",
    setup_minutes: 0,
    cleanup_minutes: 0,
    min_notice_hours: 12,
    session_packages: [
      {
        id: "e7a1e0b2-0001-4000-a000-000000000001",
        name: "Mini Ensaio — somente o baby",
        slug: "mini-ensaio-baby",
        description: "10 fotos em alta resolução",
        tier_order: 1,
        price_digital: 450,
        price_print: 500,
        upgrade_label: "Digital + Impressa",
        features: [
          "10 Fotos digitais em alta resolução",
          "Somente o baby",
          "Cenário exclusivo de Natal 2026",
          "Galeria online privada para download"
        ],
        is_active: true
      },
      {
        id: "e7a1e0b2-0002-4000-a000-000000000002",
        name: "Família — pais e irmãos",
        slug: "familia-pais-irmaos",
        description: "25 fotos em alta resolução",
        tier_order: 2,
        price_digital: 600,
        price_print: 700,
        upgrade_label: "Digital + Impressa",
        features: [
          "25 Fotos digitais em alta resolução",
          "Pais e irmãos inclusos",
          "Cenário exclusivo de Natal 2026",
          "Galeria online privada para download"
        ],
        is_active: true
      },
      {
        id: "e7a1e0b2-0003-4000-a000-000000000003",
        name: "Completo — família + acompanhantes",
        slug: "completo-familia-acompanhantes",
        description: "50 fotos em alta resolução",
        tier_order: 3,
        price_digital: 800,
        price_print: 900,
        upgrade_label: "Digital + Impressa",
        features: [
          "50 Fotos digitais em alta resolução",
          "Família completa + acompanhantes",
          "Cenário exclusivo de Natal 2026",
          "Galeria online privada para download"
        ],
        is_active: true
      }
    ]
  }
};

/**
 * Static helpers — used as synchronous fallback for server components (metadata, middleware).
 * Primary source of truth is the Supabase DB (see booking-actions.ts: fetchSessionDetails, fetchSessionBySlug).
 * SESSIONS_DATA should be kept in sync with the DB via admin sync or manual updates.
 */
export function getSlugById(id: string): string | null {
  return SESSIONS_DATA[id]?.slug || null;
}

export function getSessionBySlug(slug: string): Session | null {
  return Object.values(SESSIONS_DATA).find(s => s.slug === slug) || null;
}

export function getPackageBySlug(session: Session, packageSlug: string): SessionPackage | null {
  return session.session_packages.find(p => p.slug === packageSlug) || null;
}
