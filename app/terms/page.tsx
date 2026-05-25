"use client";

import { useLanguage } from "@/components/language/LanguageProvider";
import { AppShell } from "@/components/layout/AppShell";

const copy = {
  es: {
    eyebrow: "Legal",
    title: "Términos de uso",
    intro:
      "Esta es una versión informativa inicial para la base legal de Pictoria; no es asesoría legal final.",
    updatedLabel: "Última actualización:",
    updatedDate: "mayo de 2026",
    sections: [
      {
        title: "Uso de Pictoria",
        body: "Pictoria se ofrece como una app educativa para explorar obras, artistas, movimientos y experiencias de aprendizaje mediante quiz. Úsala de forma legal y respetuosa.",
      },
      {
        title: "Propósito educativo e informativo",
        body: "El contenido de Pictoria tiene fines educativos e informativos generales. No constituye asesoría profesional, curatorial, legal ni de autorización de derechos.",
      },
      {
        title: "Obras y contenido de terceros",
        body: "Las imágenes de obras, metadatos, información de artistas y referencias de origen pueden provenir de colecciones, museos, archivos, licenciantes o repositorios open access de terceros.",
      },
      {
        title: "Propiedad intelectual",
        body: "La marca Pictoria, el diseño de interfaz, el código y el contenido escrito original están protegidos. Las obras e imágenes de terceros siguen sujetas a sus propios derechos y licencias.",
      },
      {
        title: "Sin transferencia de propiedad",
        body: "Usar Pictoria no transfiere propiedad, licencias, derechos de reproducción ni otros derechos legales sobre obras, imágenes, metadatos o contenido de terceros.",
      },
      {
        title: "Limitación de responsabilidad",
        body: "Pictoria se ofrece tal como está. Buscamos precisión, pero no podemos garantizar que toda la información de obras, licencias o fuentes esté completa o actualizada.",
      },
      {
        title: "Cambios a los términos",
        body: "Estos términos pueden actualizarse conforme Pictoria evolucione, especialmente si se agregan cuentas, autenticación, datasets ampliados o servicios adicionales.",
      },
      {
        title: "Contacto",
        body: "Para preguntas sobre estos terminos, contacta a: se añadirá pronto.",
      },
    ],
  },
  en: {
    eyebrow: "Legal",
    title: "Terms of Use",
    intro:
      "This is an initial informational version for Pictoria's legal foundation, not final legal advice.",
    updatedLabel: "Last updated:",
    updatedDate: "May 2026",
    sections: [
      {
        title: "Use of Pictoria",
        body: "Pictoria is provided as an educational web app for exploring artworks, artists, movements, and quiz-based learning experiences. Please use it lawfully and respectfully.",
      },
      {
        title: "Educational and informational purpose",
        body: "Content in Pictoria is intended for general educational and informational use. It is not professional, curatorial, legal, or rights-clearance advice.",
      },
      {
        title: "Artwork and third-party content",
        body: "Artwork images, metadata, artist information, and source references may come from third-party collections, museums, archives, licensors, or open-access repositories.",
      },
      {
        title: "Intellectual property",
        body: "Pictoria branding, interface design, code, and original written content are protected. Third-party artworks and images remain subject to their own rights and license terms.",
      },
      {
        title: "No legal ownership transfer",
        body: "Using Pictoria does not transfer ownership, license rights, reproduction rights, or other legal rights in any artwork, image, metadata, or third-party content.",
      },
      {
        title: "Limitation of liability",
        body: "Pictoria is provided on an as-is basis. We aim for accuracy, but cannot guarantee that all artwork information, license metadata, or source details are complete or current.",
      },
      {
        title: "Changes to the terms",
        body: "These terms may be updated as Pictoria evolves, including if accounts, authentication, expanded datasets, or additional services are added.",
      },
      {
        title: "Contact placeholder",
        body: "For questions about these terms, please contact: contact channel coming soon.",
      },
    ],
  },
};

export default function TermsPage() {
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
