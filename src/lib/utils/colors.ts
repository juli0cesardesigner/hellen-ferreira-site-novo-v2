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
  
  if (n.includes('blue') || n.includes('newborn')) return {
    bg: 'bg-blue-100/50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    accent: 'bg-blue-500'
  };
  
  if (n.includes('teal') || n.includes('gestante')) return {
    bg: 'bg-teal-100/50',
    text: 'text-teal-700',
    border: 'border-teal-200',
    accent: 'bg-teal-500'
  };
  
  if (n.includes('emerald') || n.includes('green') || n.includes('família') || n.includes('familia')) return {
    bg: 'bg-emerald-100/50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    accent: 'bg-emerald-500'
  };
  
  if (n.includes('orange') || n.includes('cake') || n.includes('smash')) return {
    bg: 'bg-orange-100/50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    accent: 'bg-orange-500'
  };
  
  if (n.includes('rose') || n.includes('pink') || n.includes('feminino')) return {
    bg: 'bg-rose-100/50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    accent: 'bg-rose-500'
  };
  
  if (n.includes('amber') || n.includes('yellow') || n.includes('mensal')) return {
    bg: 'bg-amber-100/50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    accent: 'bg-amber-500'
  };
  
  if (n.includes('indigo') || n.includes('casal')) return {
    bg: 'bg-indigo-100/50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    accent: 'bg-indigo-500'
  };
  
  if (n.includes('slate') || n.includes('corporativo')) return {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    accent: 'bg-slate-500'
  };
  
  if (n.includes('sky') || n.includes('civil')) return {
    bg: 'bg-sky-100/50',
    text: 'text-sky-700',
    border: 'border-sky-200',
    accent: 'bg-sky-500'
  };
  
  if (n.includes('violet') || n.includes('purple') || n.includes('revelação') || n.includes('revelacao')) return {
    bg: 'bg-violet-100/50',
    text: 'text-violet-700',
    border: 'border-violet-200',
    accent: 'bg-violet-500'
  };
  
  return {
    bg: 'bg-zinc-50',
    text: 'text-zinc-600',
    border: 'border-zinc-200',
    accent: 'bg-zinc-400'
  };
};
