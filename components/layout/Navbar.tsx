"use client";

import Link from "next/link";
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

  return (
    <header className="sticky top-0 z-30 border-b border-white/40 bg-white/70 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="font-serif text-2xl font-semibold tracking-normal text-stone-950">
          Pictoria
        </Link>
        <div className="flex items-center gap-1 rounded-full bg-stone-950/5 p-1">
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
    </header>
  );
}
