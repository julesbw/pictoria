"use client";

import { useLanguage } from "@/components/language/LanguageProvider";
import { AppShell } from "@/components/layout/AppShell";

const copy = {
  es: {
    eyebrow: "Atribución",
    title: "Licencias y atribución",
    intro:
      "Esta página es una primera base de atribución para Pictoria. La metadata detallada de licencias debe verificarse por obra en una fase posterior.",
    updatedLabel: "Última actualización:",
    updatedDate: "mayo de 2026",
    sections: [
      {
        title: "Propiedad de las obras",
        body: "Pictoria no reclama propiedad sobre las obras. Los derechos pertenecen a sus respectivos propietarios, museos, colecciones, sucesiones o licenciantes.",
      },
      {
        title: "Dominio público y open access",
        body: "Algunas obras o imágenes pueden ser de dominio público, open access o estar bajo licencias Creative Commons. Los datos de licencia y atribución deben verificarse obra por obra.",
      },
      {
        title: "Fuentes y atribución",
        body: "Wikimedia Commons, colecciones open access de museos, fuentes de dominio público y otros repositorios pueden usarse cuando aplique. Los detalles de fuente y atribución deben seguir la metadata del proveedor original.",
      },
      {
        title: "Verificación pendiente",
        body: "Si la metadata de licencia está incompleta, no es clara o falta, debe tratarse como pendiente de verificación antes de reutilizarse fuera de Pictoria.",
      },
      {
        title: "Dudas de copyright o atribución",
        body: "Para dudas de copyright, licencias o atribución, contacta a: se añadirá pronto.",
      },
    ],
  },
  en: {
    eyebrow: "Attribution",
    title: "Licenses & Attribution",
    intro:
      "This page is a first-pass attribution foundation for Pictoria. Detailed license metadata should be verified per artwork in a later phase.",
    updatedLabel: "Last updated:",
    updatedDate: "May 2026",
    sections: [
      {
        title: "Artwork ownership",
        body: "Pictoria does not claim ownership over artworks. Artwork rights belong to their respective owners, museums, collections, estates, or licensors.",
      },
      {
        title: "Public domain and open access",
        body: "Some artworks or images may be public domain, open access, or Creative Commons licensed. License and attribution data should be verified artwork by artwork.",
      },
      {
        title: "Sources and attribution",
        body: "Wikimedia Commons, museum open access collections, public-domain sources, and other repositories may be used when applicable. Source and attribution details should follow the original provider metadata.",
      },
      {
        title: "Pending verification",
        body: "If license metadata is incomplete, unclear, or missing, it should be treated as pending verification before reuse outside Pictoria.",
      },
      {
        title: "Copyright or attribution concerns",
        body: "For copyright, licensing, or attribution concerns, please contact: contact channel coming soon.",
      },
    ],
  },
};

export default function LicensesPage() {
  const { language } = useLanguage();
  const text = copy[language];

  return (
    <AppShell themeKey="modernism">
      <article className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-3">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-zinc-700">
            {text.eyebrow}
          </p>
          <h1 className="font-serif text-4xl font-semibold text-stone-950">
            {text.title}
          </h1>
          <p className="leading-7 text-stone-700">{text.intro}</p>
          <p className="text-sm leading-6 text-stone-600">
            {text.updatedLabel}{" "}
            <strong className="font-bold text-stone-800">{text.updatedDate}</strong>
          </p>
        </header>

        <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white/75 p-6 shadow-sm sm:p-8">
          {text.sections.map((section) => (
            <section key={section.title} className="space-y-2">
              <h2 className="font-serif text-2xl font-semibold text-stone-950">
                {section.title}
              </h2>
              <p className="leading-7 text-stone-700">{section.body}</p>
            </section>
          ))}
        </div>
      </article>
    </AppShell>
  );
}
