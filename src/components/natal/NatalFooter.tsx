import React from "react";

export function NatalFooter() {
  return (
    <footer className="w-full bg-[#080605] border-t border-white/[0.06] py-6 px-4 text-center select-none relative z-10">
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center gap-1.5 text-xs text-stone-400 font-sans tracking-wide">
        <p>© 2026 Hellen Ferreira Fotografia. Todos os direitos reservados.</p>
        <p className="text-[11px] text-stone-500 tracking-wider">
          CNPJ: 28.778.598/0001-63
        </p>
      </div>
    </footer>
  );
}
