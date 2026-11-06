export interface NatalInspiracaoItem {
  id: string;
  image: string;
  alt: string;
}

export const NATAL_INSPIRACOES: NatalInspiracaoItem[] = Array.from(
  { length: 18 },
  (_, index) => {
    const num = String(index + 1).padStart(2, "0");
    return {
      id: `inspiracao-${num}`,
      image: `/natal/inspiracoes/inspiracao-${num}.webp`,
      alt: `Inspiração de produção para o Ensaio de Natal ${num} (imagem gerada por IA para referência)`,
    };
  }
);

