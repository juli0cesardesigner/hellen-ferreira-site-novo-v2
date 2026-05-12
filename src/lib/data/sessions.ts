export interface SessionPackage {
  id: string;
  name: string;
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
}

export const SESSIONS_DATA: Record<string, Session> = {
  "1595bad4-1d33-4c39-9ca3-1ec2d1849962": {
    id: "1595bad4-1d33-4c39-9ca3-1ec2d1849962",
    name: "Civil",
    slug: "civil",
    is_active: true,
    duration_slots: 2,
    deposit_price: 100,
    theme_color: "#FFD700", // Gold (Civil)
    session_packages: [
      {
        id: "3d5af0a6-ebb2-4484-b9c5-c024c886baa5",
        name: "Pacote Digital",
        description: "Discreto e Intimista",
        tier_order: 1,
        price_digital: 400,
        price_print: 475,
        upgrade_label: "Digital + Impressões 15x20",
        features: ["30 Fotos editadas em alta resolução", "Cobertura completa da cerimônia no cartório", "Fotos com padrinhos e familiares", "Mini ensaio dos noivos no local", "Entrega via galeria online personalizada"],
        is_active: true
      },
      {
        id: "2fd9d117-5b5a-4cf7-a596-10639aaced15",
        name: "O Sim & Celebração",
        description: "Sessão completa e romântica",
        tier_order: 2,
        price_digital: 560,
        price_print: 635,
        upgrade_label: "Digital + Impressões 15x20",
        features: ["50 Fotos editadas em alta resolução", "Cobertura da cerimônia no cartório", "Mini Ensaio Externo (até 1h)", "Fotos com convidados e família", "Galeria completa pronta para imprimir"],
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
        name: "Pacote Digital",
        description: "Momentos de surpresa eterna",
        tier_order: 1,
        price_digital: 450,
        price_print: 525,
        upgrade_label: "Digital + Impressões 15x20",
        features: ["15 Fotos editadas em alta resolução", "Sessão emocionante de revelação", "Entrega via galeria online"],
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
        name: "Pacote Digital",
        description: "Primeiro aninho com festa",
        tier_order: 1,
        price_digital: 450,
        price_print: 500,
        upgrade_label: "Digital + Impressões 15x20",
        features: ["15 Fotos editadas em alta resolução", "Sessão temática e divertida", "Entrega via galeria online"],
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
        name: "Pacote Digital",
        description: "Elegância e Autenticidade",
        tier_order: 1,
        price_digital: 450,
        price_print: 525,
        upgrade_label: "Digital + Impressões 15x20",
        features: ["15 Fotos em alta resolução", "Sessão em estúdio", "Até 02 trocas de looks", "Arquivo Digital entregue via galeria"],
        is_active: true
      },
      {
        id: "43509cfc-0c51-446b-9d05-0b4fa21243ba",
        name: "Retrato Celebração",
        description: "Sua história, seu legado",
        tier_order: 2,
        price_digital: 560,
        price_print: 680,
        upgrade_label: "Digital + Impressões 15x20",
        features: ["25 Fotos em alta resolução", "Sessão em estúdio ou externa", "Até 04 trocas de looks", "Arquivo Digital entregue via galeria", "Consultoria completa de estilo"],
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
        name: "Pacote Digital",
        description: "Momentos especiais juntos",
        tier_order: 1,
        price_digital: 400,
        price_print: 475,
        upgrade_label: "Digital + Impressões 15x20",
        features: ["15 Fotos editadas em alta resolução", "Sessão afetiva em família", "Entrega via galeria online"],
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
        name: "Pacote Digital",
        description: "Foco exclusivo no bebê",
        tier_order: 1,
        price_digital: 450,
        price_print: 525,
        upgrade_label: "Digital + Impressões 15x20",
        features: ["15 Fotos em alta resolução", "Sessão em estúdio", "Acessórios e cestas inclusos", "Tempo para amamentação/pausas", "Arquivo Digital via galeria"],
        is_active: true
      },
      {
        id: "cbaea88f-1476-4ab4-ab68-abd8552338eb",
        name: "Pacote Família",
        description: "O baby e as primeiras memórias",
        tier_order: 2,
        price_digital: 560,
        price_print: 680,
        upgrade_label: "Digital + Impressões 15x20",
        features: ["25 Fotos em alta resolução", "Fotos com pais e irmãos inclusas", "Cenários temáticos e atemporais", "Arquivo Digital via galeria"],
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
        name: "Pacote Digital",
        description: "Evolução registrada com delicadeza",
        tier_order: 1,
        price_digital: 150,
        price_print: 180,
        upgrade_label: "Digital + Impressões 15x20",
        features: ["10 Fotos escolhidas em alta resolução", "Sessão temática mensal", "Acompanhamento do crescimento", "Figurino do estúdio", "Entrega digital mensal"],
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
        name: "Pacote Digital",
        description: "Leve e memorável",
        tier_order: 1,
        price_digital: 650,
        price_print: 750,
        upgrade_label: "Digital + Impressões 15x20",
        features: ["25 Fotos em alta resolução", "2 trocas de roupa (acervo incluso)", "Estúdio ou Externa", "Entrega em formato digital"],
        is_active: true
      },
      {
        id: "7a21e5f3-2374-407c-9a8b-ee93d06a190e",
        name: "Ensaio Legado",
        description: "Sua história, seu legado",
        tier_order: 2,
        price_digital: 950,
        price_print: 1500,
        upgrade_label: "Digital + Álbum 20x20 + Caixa",
        features: ["45 Fotos em alta resolução", "Figurino completo incluso", "Maquiagem profissional inclusa", "Álbum 20x20 (20 páginas) + Caixa inclusos", "Entrega via galeria exclusiva"],
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
        name: "Pacote Digital",
        description: "Leve e Intimista",
        tier_order: 1,
        price_digital: 350,
        price_print: 475,
        upgrade_label: "Digital + Impressões 15x20",
        features: ["30 Fotos digitais tratadas", "Sessão em estúdio", "Duração de até 01 hora", "Guia de poses e direção afetiva", "Entrega via galeria online"],
        is_active: true
      },
      {
        id: "999f17e1-efdf-4847-a3b1-5e61ed80c886",
        name: "Aventura a Dois",
        description: "Um dia inesquecível",
        tier_order: 2,
        price_digital: 500,
        price_print: 650,
        upgrade_label: "Digital + Impressões 15x20",
        features: ["50 Fotos digitais tratadas", "Sessão em locação externa", "Cobertura de estilo Life Style", "Galeria completa personalizada", "Consultoria para o destino"],
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
        name: "Pacote Digital",
        description: "Retratos profissionais",
        tier_order: 1,
        price_digital: 450,
        price_print: 525,
        upgrade_label: "Digital + Impressões 15x20",
        features: ["15 Fotos em alta resolução", "Sessão exclusiva em estúdio", "Até 02 trocas de roupa", "Arquivo Digital de alta qualidade"],
        is_active: true
      },
      {
        id: "c906f9ca-c303-4084-a8a3-13340e2ec45b",
        name: "Branding Pessoal",
        description: "Apresentação de marca",
        tier_order: 2,
        price_digital: 560,
        price_print: 680,
        upgrade_label: "Digital + Impressões 15x20",
        features: ["25 Fotos em alta resolução", "Realizado em estúdio ou Empresa", "Até 03 trocas de roupa", "Guia de posicionamento e autoridade"],
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
        description: "Amor em cada clique",
        tier_order: 1,
        price_digital: 450,
        price_print: 500,
        upgrade_label: "Digital + Porta Retrato",
        features: ["15 Fotos digitais", "Cenário exclusivo de Dia das Mães", "Entrega via galeria online"],
        is_active: true
      }
    ]
  }
};

export function getSlugById(id: string): string | null {
  return SESSIONS_DATA[id]?.slug || null;
}
