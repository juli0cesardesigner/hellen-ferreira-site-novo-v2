"use client";

import { useEffect } from "react";

export function ErudaDebugger() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const debugParam = urlParams.get("debug");

      // Desativar se o usuário passar ?debug=false ou ?debug=off
      if (debugParam === "false" || debugParam === "off" || debugParam === "0") {
        localStorage.removeItem("__eruda_debug_active__");
        const erudaContainer = document.getElementById("eruda");
        if (erudaContainer) erudaContainer.remove();
        return;
      }

      // Ativar se vier ?debug=true ou se já estiver ativo no localStorage
      const isDebugActive =
        debugParam === "true" ||
        debugParam === "1" ||
        localStorage.getItem("__eruda_debug_active__") === "true";

      if (isDebugActive) {
        localStorage.setItem("__eruda_debug_active__", "true");

        // Dynamic import para carregar o bundle do Eruda sob demanda sem pesar no bundle inicial
        import("eruda").then((erudaModule) => {
          const eruda = erudaModule.default || erudaModule;
          if (typeof window !== "undefined" && !(window as any).__eruda_initialized__) {
            eruda.init({
              tool: ["console", "elements", "network", "resources", "info", "snippets"],
              useShadowDom: true,
              autoScale: true,
            });
            (window as any).__eruda_initialized__ = true;
            // Reposiciona o botão do Eruda para o canto superior direito para não cobrir a barra de lâminas inferior
            try {
              if (typeof eruda.position === "function") {
                eruda.position({ x: window.innerWidth - 30, y: 70 });
              }
            } catch {}
            console.info("🛠️ [Eruda Debugger] Console ativo. Para desativar, acesse com ?debug=false");
          }
        }).catch((err) => {
          console.warn("[Eruda] Não foi possível carregar o console móvel:", err);
        });
      }
    } catch {
      // Falha silenciosa em navegadores com localStorage restrito
    }
  }, []);

  return null;
}

