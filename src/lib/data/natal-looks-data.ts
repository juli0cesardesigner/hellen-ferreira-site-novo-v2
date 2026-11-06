export type LookGender = "menina" | "menino";

export type LookSize = "P" | "M" | "G" | "GG" | "1 ano" | "2 anos";

export interface NatalChildLook {
  id: string;
  gender: LookGender;
  size: LookSize;
  image: string;
}

export const GENDER_FILTERS: { id: "todos" | LookGender; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "menina", label: "Menina" },
  { id: "menino", label: "Menino" },
];

export const SIZE_FILTERS: { id: "todas" | LookSize; label: string }[] = [
  { id: "todas", label: "Todos os tamanhos" },
  { id: "P", label: "P" },
  { id: "M", label: "M" },
  { id: "G", label: "G" },
  { id: "GG", label: "GG" },
  { id: "1 ano", label: "1 ano" },
  { id: "2 anos", label: "2 anos" },
];

export const NATAL_CHILD_LOOKS: NatalChildLook[] = [
  // ==========================================================================
  // MENINAS (Pasta As -> /natal/looks/as/)
  // ==========================================================================
  { id: "as-6782", gender: "menina", size: "1 ano", image: "/natal/looks/as/IMG_6782.webp" },
  { id: "as-6783", gender: "menina", size: "P", image: "/natal/looks/as/IMG_6783.webp" },
  { id: "as-6784", gender: "menina", size: "2 anos", image: "/natal/looks/as/IMG_6784.webp" },
  { id: "as-6786", gender: "menina", size: "P", image: "/natal/looks/as/IMG_6786.webp" },
  { id: "as-6787", gender: "menina", size: "GG", image: "/natal/looks/as/IMG_6787.webp" },
  { id: "as-6789", gender: "menina", size: "1 ano", image: "/natal/looks/as/IMG_6789.webp" },
  { id: "as-6790", gender: "menina", size: "G", image: "/natal/looks/as/IMG_6790.webp" },
  { id: "as-6792", gender: "menina", size: "1 ano", image: "/natal/looks/as/IMG_6792.webp" },
  { id: "as-6794", gender: "menina", size: "G", image: "/natal/looks/as/IMG_6794.webp" },
  { id: "as-6795", gender: "menina", size: "P", image: "/natal/looks/as/IMG_6795.webp" },
  { id: "as-6796", gender: "menina", size: "M", image: "/natal/looks/as/IMG_6796.webp" },
  { id: "as-6798", gender: "menina", size: "G", image: "/natal/looks/as/IMG_6798.webp" },
  { id: "as-6799", gender: "menina", size: "1 ano", image: "/natal/looks/as/IMG_6799.webp" },
  { id: "as-6800", gender: "menina", size: "GG", image: "/natal/looks/as/IMG_6800.webp" },
  { id: "as-6801", gender: "menina", size: "1 ano", image: "/natal/looks/as/IMG_6801.webp" },
  { id: "as-6802", gender: "menina", size: "1 ano", image: "/natal/looks/as/IMG_6802.webp" },
  { id: "as-6946", gender: "menina", size: "1 ano", image: "/natal/looks/as/IMG_6946.webp" },
  { id: "as-6948", gender: "menina", size: "1 ano", image: "/natal/looks/as/IMG_6948.webp" },

  // ==========================================================================
  // MENINOS (Pasta Os -> /natal/looks/os/)
  // ==========================================================================
  { id: "os-6805", gender: "menino", size: "1 ano", image: "/natal/looks/os/IMG_6805.webp" },
  { id: "os-6809", gender: "menino", size: "1 ano", image: "/natal/looks/os/IMG_6809.webp" },
  { id: "os-6810", gender: "menino", size: "1 ano", image: "/natal/looks/os/IMG_6810.webp" },
  { id: "os-6812", gender: "menino", size: "M", image: "/natal/looks/os/IMG_6812.webp" },
  { id: "os-6813", gender: "menino", size: "GG", image: "/natal/looks/os/IMG_6813.webp" },
  { id: "os-6814", gender: "menino", size: "2 anos", image: "/natal/looks/os/IMG_6814.webp" },
  { id: "os-6815", gender: "menino", size: "P", image: "/natal/looks/os/IMG_6815.webp" },
  { id: "os-6816", gender: "menino", size: "1 ano", image: "/natal/looks/os/IMG_6816.webp" },
  { id: "os-6818", gender: "menino", size: "M", image: "/natal/looks/os/IMG_6818.webp" },
  { id: "os-6820", gender: "menino", size: "GG", image: "/natal/looks/os/IMG_6820.webp" },
  { id: "os-6821", gender: "menino", size: "G", image: "/natal/looks/os/IMG_6821.webp" },
];
