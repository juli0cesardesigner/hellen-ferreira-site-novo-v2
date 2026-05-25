"use client";

import React from "react";
import { 
  Calendar, 
  ShieldCheck, 
  Clock, 
  BarChart, 
  Receipt, 
  Settings,
  User
} from "lucide-react";

interface AdminBottomNavProps {
  activeTab: string;
  onTabChange: (tab: any) => void;
  disabled?: boolean;
}

const adminNavItems = [
  { id: 'calendar', name: "Agenda", icon: Calendar },
  { id: 'clients', name: "Clientes", icon: User },
  { id: 'blocks', name: "Bloqueios", icon: ShieldCheck },
  { id: 'slots', name: "Horários", icon: Clock },
  { id: 'finance', name: "Grana", icon: BarChart },
  { id: 'expenses', name: "Saídas", icon: Receipt },
  { id: 'sessions', name: "Serviços", icon: Settings },
];

export function AdminBottomNav({ activeTab, onTabChange, disabled }: AdminBottomNavProps) {
  const activeIndex = adminNavItems.findIndex(item => item.id === activeTab);
  
  return (
    <div className={`lg:hidden fixed bottom-0 left-0 right-0 z-[100] w-full transition-opacity duration-300 ${disabled ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
      <div className="relative bg-[#020617]/95 backdrop-blur-lg h-[70px] rounded-t-[24px] flex justify-center items-center shadow-[0_-10px_40px_rgba(0,0,0,0.4)] px-2 border-t border-white/10 pb-safe">
        <ul className="flex w-full relative justify-between px-1 h-full items-center">
          
          {/* Indicador de Deslizamento (Simples e Elegante) */}
          <div 
            className="absolute h-[50px] bg-white/10 rounded-2xl transition-all duration-500 ease-out shadow-[0_0_20px_rgba(255,255,255,0.05)]"
            style={{ 
              width: `calc((100% - 16px) / ${adminNavItems.length})`,
              left: `calc(8px + ${activeIndex} * ((100% - 16px) / ${adminNavItems.length}))`,
            }}
          />

          {adminNavItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeIndex === index;

            return (
              <li key={item.id} className="relative list-none flex-1 h-full z-[1]">
                <button
                  onClick={() => onTabChange(item.id)}
                  className="relative flex flex-col justify-center items-center w-full h-full text-center bg-transparent border-none outline-none cursor-pointer"
                >
                  <span 
                    className={`relative block transition-all duration-300 ${
                      isActive ? "text-white scale-110" : "text-slate-500 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  </span>
                  <span 
                    className={`text-[7px] uppercase font-black tracking-widest mt-1 transition-all duration-300 ${
                      isActive ? "text-white opacity-100" : "text-slate-500 opacity-0 scale-75"
                    }`}
                  >
                    {item.name}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      
      {/* Preenchimento para a área do indicador de home (iOS/Android) */}
      <div className="h-[env(safe-area-inset-bottom)] bg-[#020617]/95" />
    </div>
  );
}
