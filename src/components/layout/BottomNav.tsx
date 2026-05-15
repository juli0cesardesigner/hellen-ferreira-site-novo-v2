"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { List, Calendar, Lock, LogOut, BarChart3 } from "lucide-react";

const adminNavItems = [
  { name: "Agendamentos", icon: List, href: "/admin" },
  { name: "Calendário", icon: Calendar, href: "/admin/calendar" },
  { name: "Bloqueios", icon: Lock, href: "/admin/blocked-dates" },
  { name: "Métricas", icon: BarChart3, href: "/admin/stats" },
  { name: "Sair", icon: LogOut, href: "/auth/logout" },
];

export function AdminBottomNav() {
  const pathname = usePathname();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const index = adminNavItems.findIndex(item => 
      item.href === "/admin" ? pathname === "/admin" : pathname?.startsWith(item.href)
    );
    if (index !== -1) setActiveIndex(index);
  }, [pathname]);

  // Se não estiver em rota admin, não renderiza nada
  if (!pathname?.startsWith("/admin")) return null;

  return (
    <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-[360px]">
      <div className="relative bg-slate-900 h-[70px] rounded-[20px] flex justify-center items-center shadow-[0_10px_30px_rgba(0,0,0,0.3)] px-1">
        <ul className="flex w-full relative justify-center">
          {adminNavItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeIndex === index;

            return (
              <li key={item.name} className="relative list-none w-[68px] h-[70px] z-[1]">
                <Link
                  href={item.href}
                  className="relative flex flex-col justify-center items-center w-full h-full text-center"
                  onClick={() => setActiveIndex(index)}
                >
                  <span 
                    className={`relative block transition-all duration-500 text-slate-400 z-10 ${
                      isActive ? "translate-y-[-32px] text-white" : "opacity-70"
                    }`}
                  >
                    <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  </span>
                  <span 
                    className={`absolute text-[8px] uppercase font-bold tracking-[0.05em] transition-all duration-500 text-slate-300 ${
                      isActive ? "translate-y-[18px] opacity-100" : "opacity-0 translate-y-[30px]"
                    }`}
                  >
                    {item.name}
                  </span>
                </Link>
              </li>
            );
          })}
          
          {/* Indicador Mágico (Estilo Admin Dark) */}
          <div 
            className="absolute -top-[50%] w-[68px] h-[70px] bg-slate-100 border-[6px] border-slate-100 rounded-full transition-all duration-500 ease-out flex justify-center items-center before:content-[''] before:absolute before:top-[19px] before:left-[-22px] before:w-5 before:h-5 before:bg-transparent before:rounded-tr-[20px] before:shadow-[1px_-10px_0_0_#f1f5f9] after:content-[''] after:absolute after:top-[19px] after:right-[-22px] after:w-5 after:h-5 after:bg-transparent after:rounded-tl-[20px] after:shadow-[-1px_-10px_0_0_#f1f5f9]"
            style={{ 
              left: `calc(${activeIndex} * 68px)`,
            }}
          >
            <div className="w-[48px] h-[48px] bg-slate-900 rounded-full shadow-[0_5px_15px_rgba(0,0,0,0.4)]" />
          </div>
        </ul>
      </div>
      
      <style jsx>{`
        /* Ajuste de cores para o recorte do fundo do admin */
        .bg-slate-100 { background-color: #f1f5f9; }
      `}</style>
    </div>
  );
}
