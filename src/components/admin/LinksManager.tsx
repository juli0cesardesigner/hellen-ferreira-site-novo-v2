"use client";

import React, { useState } from "react";
import { Copy, Check, Link2 } from "lucide-react";

interface EnsaioLink {
  id: string;
  name: string;
  path: string;
  description?: string;
}

const ENSAIO_LINKS: EnsaioLink[] = [
  { id: "gestante", name: "Gestante", path: "/gestante" },
  { id: "newborn-menino", name: "Newborn Menino", path: "/newborn-menino" },
  { id: "newborn-menina", name: "Newborn Menina", path: "/newborn-menina" },
  { id: "mensal-menino", name: "Mensal Menino", path: "/mensal-menino" },
  { id: "mensal-menina", name: "Mensal Menina", path: "/mensal-menina" },
  { id: "smash", name: "Smash the Cake", path: "/smash" },
  { id: "revelacao", name: "Revelação", path: "/revelacao" },
  { id: "familia", name: "Família", path: "/familia" },
  { id: "feminino", name: "Feminino", path: "/feminino" },
  { id: "corporativo", name: "Corporativo", path: "/corporativo" },
  { id: "civil", name: "Civil", path: "/civil" },
  { id: "casal", name: "Casal", path: "/casal" },
  { id: "looks", name: "Acervo de Looks", path: "/looks" },
  { id: "ensaios", name: "Catálogo Completo (Ensaios)", path: "/ensaios" },
];

export function LinksManager() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (path: string, id: string) => {
    const fullUrl = `${window.location.origin}${path}`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(fullUrl);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = fullUrl;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }

    setCopiedId(id);
    setTimeout(() => {
      setCopiedId((curr) => (curr === id ? null : curr));
    }, 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Container Principal */}
      <div className="bg-[var(--color-admin-surface)] border border-[var(--color-admin-border)] rounded-[2rem] p-6 lg:p-8 shadow-sm">
        
        {/* Cabeçalho */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[var(--color-admin-border)]">
          <div className="w-12 h-12 rounded-2xl bg-[var(--color-admin-accent)]/10 text-[var(--color-admin-accent)] flex items-center justify-center shrink-0">
            <Link2 size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-[18px] font-bold text-[var(--color-admin-text)] tracking-tight">
              Links Rápidos dos Ensaios
            </h3>
            <p className="text-[12px] text-[var(--color-admin-text-muted)] mt-0.5">
              Clique em qualquer ensaio abaixo para copiar o link direto para a área de transferência.
            </p>
          </div>
        </div>

        {/* Grade de Botões */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ENSAIO_LINKS.map((item) => {
            const isCopied = copiedId === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleCopy(item.path, item.id)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 text-left cursor-pointer group active:scale-[0.98] ${
                  isCopied
                    ? "bg-emerald-500/10 border-emerald-500/60 shadow-sm"
                    : "bg-[var(--color-admin-bg)] border-[var(--color-admin-border)] hover:border-[var(--color-admin-accent)] hover:shadow-md"
                }`}
              >
                <div className="flex flex-col min-w-0 pr-3">
                  <span
                    className={`text-[14px] font-bold tracking-tight truncate transition-colors ${
                      isCopied
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-[var(--color-admin-text)] group-hover:text-[var(--color-admin-accent)]"
                    }`}
                  >
                    {item.name}
                  </span>
                  <span className="text-[11px] font-mono text-[var(--color-admin-text-muted)] opacity-60 truncate">
                    {item.path}
                  </span>
                </div>

                <div
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all ${
                    isCopied
                      ? "bg-emerald-600 text-white"
                      : "bg-[var(--color-admin-surface)] text-[var(--color-admin-text-muted)] border border-[var(--color-admin-border)] group-hover:bg-[var(--color-admin-accent)] group-hover:text-white group-hover:border-[var(--color-admin-accent)]"
                  }`}
                >
                  {isCopied ? (
                    <>
                      <Check size={14} strokeWidth={3} />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} strokeWidth={2} />
                      <span>Copiar</span>
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
