"use client";

import Link from "next/link";
import { LanguageToggle } from "@/components/language/LanguageToggle";
import { useLanguage } from "@/components/language/LanguageProvider";

const copy = {
  es: {
    body:
      "La marca, interfaz y contenido original de Pictoria están protegidos. Los derechos de las obras e imágenes pertenecen a sus respectivos propietarios, museos, colecciones o licenciantes.",
    navLabel: "Legal",
    links: [
      { href: "/terms", label: "Términos" },
      { href: "/privacy", label: "Privacidad" },
      { href: "/licenses", label: "Licencias" },
    ],
  },
  en: {
    body:
      "Pictoria branding, interface design, and original content are protected. Artwork rights and images belong to their respective owners, museums, collections, or licensors.",
    navLabel: "Legal",
    links: [
      { href: "/terms", label: "Terms" },
      { href: "/privacy", label: "Privacy" },
      { href: "/licenses", label: "Licenses" },
    ],
  },
};

export function Footer() {
  const { language } = useLanguage();
  const text = copy[language];

  return (
    <footer className="mt-auto border-t border-stone-950/10 bg-white/35 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6 text-xs leading-6 text-stone-700 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-2xl space-y-1">
          <p className="font-semibold text-stone-950">© 2026 Pictoria™</p>
          <p>{text.body}</p>
        </div>

        <div className="flex flex-col items-start gap-3 md:items-end">
          <LanguageToggle />
          <nav aria-label={text.navLabel} className="flex flex-wrap gap-x-4 gap-y-2">
            {text.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-semibold text-stone-700 transition hover:text-stone-950"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
