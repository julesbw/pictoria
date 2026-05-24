"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useLanguage } from "@/components/language/LanguageProvider";
import { cn } from "@/lib/utils";

const links = {
  es: [
    { href: "/", label: "Inicio" },
    { href: "/quiz", label: "Quiz" },
    { href: "/explore", label: "Explorar" },
    { href: "/gallery", label: "Galería" },
  ],
  en: [
    { href: "/", label: "Home" },
    { href: "/quiz", label: "Quiz" },
    { href: "/explore", label: "Explore" },
    { href: "/gallery", label: "Gallery" },
  ],
};

export function Navbar() {
  const pathname = usePathname();
  const { language } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuId = "mobile-navigation";

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-30 border-b border-white/40 bg-white/70 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-serif text-2xl font-semibold tracking-normal text-stone-950"
        >
          <Image
            src="/brand/pictoria-icon.png"
            alt=""
            width={40}
            height={40}
            priority
            className="h-10 w-10 rounded-xl shadow-sm"
          />
          <span>Pictoria</span>
        </Link>
        <button
          type="button"
          aria-label={language === "es" ? "Abrir menú de navegación" : "Open navigation menu"}
          aria-expanded={isMobileMenuOpen}
          aria-controls={mobileMenuId}
          onClick={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-stone-950/5 text-stone-950 transition hover:bg-stone-950/10 focus:outline-none focus:ring-2 focus:ring-stone-950/20 md:hidden"
        >
          <span className="sr-only">
            {language === "es" ? "Menú de navegación" : "Navigation menu"}
          </span>
          <span className="flex w-5 flex-col gap-1.5" aria-hidden="true">
            <span className="h-0.5 rounded-full bg-current" />
            <span className="h-0.5 rounded-full bg-current" />
            <span className="h-0.5 rounded-full bg-current" />
          </span>
        </button>
        <div className="hidden items-center gap-1 rounded-full bg-stone-950/5 p-1 md:flex">
          {links[language].map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative rounded-full px-3 py-2 text-sm font-medium text-stone-700 transition",
                  active && "text-stone-950",
                )}
              >
                {active ? (
                  <motion.span
                    layoutId="navbar-pill"
                    className="absolute inset-0 rounded-full bg-white shadow-sm"
                    transition={{ type: "spring", bounce: 0.18, duration: 0.45 }}
                  />
                ) : null}
                <span className="relative z-10">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
      {isMobileMenuOpen ? (
        <div id={mobileMenuId} className="mx-auto max-w-6xl px-4 pb-4 sm:px-6 md:hidden">
          <div className="grid gap-1 rounded-2xl bg-stone-950/5 p-2">
            {links[language].map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "rounded-xl px-4 py-3 text-sm font-semibold text-stone-700 transition hover:bg-white/80",
                    active && "bg-white text-stone-950 shadow-sm",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}
    </header>
  );
}
