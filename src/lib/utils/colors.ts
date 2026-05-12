export const getSessionColor = (name: string, customColor?: string) => {
  // Se for um HEX personalizado, retornamos um modo especial "custom"
  if (customColor?.startsWith('#')) {
    return {
      bg: 'bg-custom', // Marcador para usarmos inline style se necessário, ou apenas deixar como base
      text: 'text-custom',
      border: 'border-custom',
      accent: 'bg-custom-accent',
      isCustom: true,
      customColor: customColor,
      // Geramos variações aproximadas (ex: 10% opacidade para fundo)
      styles: {
        backgroundColor: `${customColor}15`, // ~10% opacity
        color: customColor,
        borderColor: `${customColor}35`, // ~20% opacity
        accentColor: customColor
      }
    };
  }

  const n = (customColor || name || "")?.toLowerCase() || "";
  
  if (n.includes('blue') || n.includes('mensal') || n.includes('acompanhamento')) return {
    bg: 'bg-blue-100',
    text: 'text-blue-900',
    border: 'border-blue-300',
    accent: 'bg-blue-600'
  };
  
  if (n.includes('gestante')) return {
    bg: 'bg-sky-200',
    text: 'text-sky-950',
    border: 'border-sky-400',
    accent: 'bg-sky-600'
  };
  
  if (n.includes('família') || n.includes('familia')) return {
    bg: 'bg-emerald-200',
    text: 'text-emerald-950',
    border: 'border-emerald-400',
    accent: 'bg-emerald-700'
  };
  
  if (n.includes('smash')) return {
    bg: 'bg-cyan-100',
    text: 'text-cyan-900',
    border: 'border-cyan-300',
    accent: 'bg-cyan-500'
  };
  
  if (n.includes('feminino')) return {
    bg: 'bg-red-200',
    text: 'text-red-950',
    border: 'border-red-400',
    accent: 'bg-red-600'
  };
  
  if (n.includes('newborn') || n.includes('bebê')) return {
    bg: 'bg-rose-100',
    text: 'text-rose-900',
    border: 'border-rose-300',
    accent: 'bg-rose-400'
  };
  
  if (n.includes('casal')) return {
    bg: 'bg-orange-200',
    text: 'text-orange-950',
    border: 'border-orange-400',
    accent: 'bg-orange-600'
  };
  
  if (n.includes('corporativo')) return {
    bg: 'bg-slate-300',
    text: 'text-slate-950',
    border: 'border-slate-500',
    accent: 'bg-slate-900'
  };
  
  if (n.includes('civil')) return {
    bg: 'bg-amber-200',
    text: 'text-amber-950',
    border: 'border-amber-400',
    accent: 'bg-amber-600'
  };
  
  if (n.includes('revelação') || n.includes('revelacao')) return {
    bg: 'bg-purple-200',
    text: 'text-purple-950',
    border: 'border-purple-400',
    accent: 'bg-purple-600'
  };

  if (n.includes('mães') || n.includes('maes')) return {
    bg: 'bg-pink-200',
    text: 'text-pink-950',
    border: 'border-pink-400',
    accent: 'bg-pink-600'
  };
  
  return {
    bg: 'bg-zinc-50',
    text: 'text-zinc-600',
    border: 'border-zinc-200',
    accent: 'bg-zinc-400'
  };
};
