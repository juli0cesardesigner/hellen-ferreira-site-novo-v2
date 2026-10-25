"use client";

import React, { useEffect, useRef } from "react";

interface DynamicFireSparksProps {
  desktopCount?: number;
  mobileCount?: number;
}

const EMBER_COLORS = [
  "#ffd166", // Amarelo dourado
  "#ff9a5a", // Laranja suave
  "#ff6b35", // Brasa quente
  "#ffbc42", // Dourado âmbar
];

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  maxAlpha: number;
  life: number;
  maxLife: number;
}

export function DynamicFireSparks({
  desktopCount = 45,
  mobileCount = 18,
}: DynamicFireSparksProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const isMobile = width < 768;
    const count = isMobile ? mobileCount : desktopCount;

    // Função para criar uma faísca em um local 100% novo e aleatório
    const createSpark = (): Spark => {
      const maxLife = 60 + Math.random() * 80; // Duração do ciclo de vida
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4, // Leve deriva horizontal
        vy: -0.2 - Math.random() * 0.5,  // Suave subida como brasa real
        size: 1.5 + Math.random() * 2.5,  // Tamanho delicado (1.5px a 4px)
        color: EMBER_COLORS[Math.floor(Math.random() * EMBER_COLORS.length)],
        alpha: 0,
        maxAlpha: 0.35 + Math.random() * 0.45,
        life: 0,
        maxLife,
      };
    };

    // Pool de partículas
    const sparks: Spark[] = Array.from({ length: count }, () => {
      const s = createSpark();
      s.life = Math.random() * s.maxLife; // Desfasa os momentos de nascimento
      return s;
    });

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < sparks.length; i++) {
        const s = sparks[i];

        s.life++;
        s.x += s.vx;
        s.y += s.vy;

        // Curva de fade-in e fade-out (surge suavemente e desvanece)
        const progress = s.life / s.maxLife;
        if (progress < 0.35) {
          s.alpha = (progress / 0.35) * s.maxAlpha;
        } else {
          s.alpha = (1 - (progress - 0.35) / 0.65) * s.maxAlpha;
        }

        // Quando o ciclo termina, ela renasce em um lugar COMPLETAMENTE NOVO
        if (s.life >= s.maxLife) {
          sparks[i] = createSpark();
          continue;
        }

        // Desenhar a micro-brasa com halo suave
        ctx.save();
        ctx.globalAlpha = Math.max(0, s.alpha);
        ctx.fillStyle = s.color;
        ctx.shadowBlur = s.size * 2.5;
        ctx.shadowColor = s.color;

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
    };
  }, [desktopCount, mobileCount]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-30 select-none mix-blend-screen"
      aria-hidden="true"
    />
  );
}
