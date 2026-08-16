"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { Menu, X } from "lucide-react";
import { SITE_CONFIG } from "@/lib/constants";

const navLinks = [
  { name: "Início", href: "/" },
  { name: "Sessões", href: SITE_CONFIG.links.services },
  { name: "Sobre", href: SITE_CONFIG.links.about },
  { name: "Links", href: SITE_CONFIG.links.links },
];

export function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const { scrollY } = useScroll();

  const backgroundColor = useTransform(
    scrollY,
    [0, 50],
    ["rgba(252, 251, 249, 0)", "rgba(252, 251, 249, 0.95)"]
  );

  const borderBottom = useTransform(
    scrollY,
    [0, 50],
    ["1px solid rgba(230, 223, 211, 0)", "1px solid rgba(230, 223, 211, 1)"]
  );

  return (
    <motion.nav
      style={{ backgroundColor, borderBottom }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-sm"
    >
      <div className="container-custom flex items-center justify-between h-20">
        <Link href="/" className="flex items-center group">
          <div className="relative w-20 md:w-32 grayscale group-hover:grayscale-0 transition-all duration-500">
            <Image
              src="/brand/logo.svg"
              alt="Logo Hellen Ferreira"
              width={64}
              height={64}
              className="w-full h-auto object-contain"
              priority
            />
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-xs uppercase tracking-[0.15em] text-text-medium hover:text-blush transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-text-dark"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-pearl border-b border-sand px-6 py-10 flex flex-col gap-6"
        >
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm uppercase tracking-[0.2em] text-text-medium"
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
        </motion.div>
      )}
    </motion.nav>
  );
}
