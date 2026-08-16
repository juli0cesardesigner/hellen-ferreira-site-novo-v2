"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Copy, Check, ExternalLink, Link2 } from "lucide-react";

interface EnsaioLink {
  id: string;
  name: string;
  path: string;
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

export default function LinksPage() {
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
    <main className="min-h-screen bg-pearl pt-28 pb-20 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        {/* Cabeçalho */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-sand/30 text-text-dark mb-4">
            <Link2 className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-serif text-text-dark mb-2">Links dos Ensaios</h1>
          <p className="text-sm text-text-medium">
            Clique no botão do ensaio para copiar o link para a sua área de transferência.
          </p>
        </div>

        {/* Lista de Botões */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ENSAIO_LINKS.map((item) => {
            const isCopied = copiedId === item.id;

            return (
              <div
                key={item.id}
                className={`relative flex items-center justify-between p-4 rounded-xl border transition-all duration-200 bg-white/80 backdrop-blur-sm ${
                  isCopied
                    ? "border-emerald-500 bg-emerald-50/80 shadow-sm"
                    : "border-sand/40 hover:border-sand hover:bg-white hover:shadow-md"
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleCopy(item.path, item.id)}
                  className="flex-1 flex items-center justify-between text-left pr-2 cursor-pointer"
                  title="Clique para copiar o link"
                >
                  <span
                    className={`font-medium text-sm transition-colors ${
                      isCopied ? "text-emerald-700" : "text-text-dark"
                    }`}
                  >
                    {item.name}
                  </span>

                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-all ${
                      isCopied
                        ? "bg-emerald-600 text-white"
                        : "bg-sand/30 text-text-medium hover:bg-text-dark hover:text-white"
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copiar
                      </>
                    )}
                  </span>
                </button>

                {/* Link direto para visualização rápida */}
                <Link
                  href={item.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-text-light hover:text-text-dark transition-colors border-l border-sand/30 pl-2"
                  title={`Abrir ${item.name} em nova aba`}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
