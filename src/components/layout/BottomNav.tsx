"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Camera, User, Calendar, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
  { name: "Início", icon: Home, href: "/" },
  { name: "Sessões", icon: Camera, href: "/servicos" },
  { name: "Agendar", icon: Calendar, href: "/agendar" },
  { name: "Sobre", icon: User, href: "/sobre" },
  { name: "Contato", icon: MessageCircle, href: "https://wa.me/5511982260582" },
];

export function BottomNav() {
  const pathname = usePathname();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const index = navItems.findIndex(item => 
      item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href)
    );
    if (index !== -1) setActiveIndex(index);
  }, [pathname]);

  return (
    <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-[360px]">
      <div className="relative bg-white h-[70px] rounded-[20px] flex justify-center items-center shadow-[0_10px_25px_rgba(0,0,0,0.1)] px-1">
        <ul className="flex w-full relative justify-center">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeIndex === index;

            return (
              <li key={item.name} className="relative list-none w-[70px] h-[70px] z-[1]">
                <Link
                  href={item.href}
                  className="relative flex flex-col justify-center items-center w-full h-full text-center"
                  onClick={() => setActiveIndex(index)}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                >
                  <span 
                    className={`relative block transition-all duration-500 text-text-dark z-10 ${
                      isActive ? "translate-y-[-32px] text-white" : "opacity-70"
                    }`}
                  >
                    <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                  </span>
                  <span 
                    className={`absolute text-[9px] uppercase font-bold tracking-[0.1em] transition-all duration-500 text-text-medium ${
                      isActive ? "translate-y-[18px] opacity-100" : "opacity-0 translate-y-[30px]"
                    }`}
                  >
                    {item.name}
                  </span>
                </Link>
              </li>
            );
          })}
          
          {/* Indicador Mágico */}
          <div 
            className="absolute -top-[50%] w-[70px] h-[70px] bg-pearl border-[6px] border-pearl rounded-full transition-all duration-500 ease-out flex justify-center items-center before:content-[''] before:absolute before:top-[19px] before:left-[-22px] before:w-5 before:h-5 before:bg-transparent before:rounded-tr-[20px] before:shadow-[1px_-10px_0_0_#FCFBF9] after:content-[''] after:absolute after:top-[19px] after:right-[-22px] after:w-5 after:h-5 after:bg-transparent after:rounded-tl-[20px] after:shadow-[-1px_-10px_0_0_#FCFBF9]"
            style={{ 
              left: `calc(${activeIndex} * 70px)`,
            }}
          >
            <div className="w-[50px] h-[50px] bg-blush rounded-full shadow-[0_5px_15px_rgba(212,163,157,0.6)]" />
          </div>
        </ul>
      </div>
      
      {/* Estilos específicos para a curva do indicador (Magic Cutout) */}
      <style jsx>{`
        .bg-pearl { background-color: #FCFBF9; }
      `}</style>
    </div>
  );
}
