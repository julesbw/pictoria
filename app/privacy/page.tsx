"use client";

import { useLanguage } from "@/components/language/LanguageProvider";
import { AppShell } from "@/components/layout/AppShell";

const copy = {
  es: {
    eyebrow: "Legal",
    title: "Política de privacidad",
    intro:
      "Esta política inicial describe el MVP y puede evolucionar si Pictoria agrega cuentas, autenticación, analítica o funciones en la nube.",
    updatedLabel: "Última actualización:",
    updatedDate: "mayo de 2026",
    sections: [
      {
        title: "Información que podemos recopilar",
        body: "Pictoria puede recopilar información que las personas usuarias proporcionen directamente en funciones futuras. En el MVP actual, el progreso del quiz, favoritos y preferencia de idioma se guardan localmente en el navegador.",
      },
      {
        title: "Datos técnicos y logs",
        body: "Los proveedores de hosting, API o infraestructura pueden procesar datos técnicos como información del dispositivo, logs de solicitud, dirección IP, tipo de navegador, fechas y diagnósticos de error.",
      },
      {
        title: "Analítica o proveedores de hosting",
        body: "Pictoria puede usar proveedores de hosting o analítica para operar, monitorear y mejorar la app. Si se agrega analítica, esta política debe actualizarse con el proveedor y el alcance de datos.",
      },
      {
        title: "Cookies y almacenamiento local",
        body: "Pictoria usa local storage para funciones como favoritos, estado de sesión del quiz y preferencia de idioma. Pueden usarse cookies si futuras funciones de hosting, analítica, autenticación o cuentas lo requieren.",
      },
      {
        title: "Servicios de terceros",
        body: "Pictoria puede usar servicios como Vercel, Supabase, Cloudinary, Wikimedia o fuentes de museos/open access cuando aplique para hosting, almacenamiento de datos, entrega de medios o material fuente de obras.",
      },
      {
        title: "Derechos de usuario y contacto",
        body: "Según tu ubicación, puedes tener derechos para solicitar acceso, corrección, eliminación o más información sobre datos personales. Contacto: se añadirá pronto.",
      },
      {
        title: "Actualizaciones futuras",
        body: "Si se agregan cuentas, autenticación, favoritos sincronizados en la nube, rankings, pagos o funciones con contenido de usuarios, esta política debe actualizarse antes de publicar esas funciones.",
      },
    ],
  },
  en: {
    eyebrow: "Legal",
    title: "Privacy Policy",
    intro:
      "This initial policy describes the MVP and may evolve as Pictoria adds accounts, authentication, analytics, or cloud features.",
    updatedLabel: "Last updated:",
    updatedDate: "May 2026",
    sections: [
      {
        title: "Information we may collect",
        body: "Pictoria may collect information that users provide directly in future features. In the current MVP, core quiz progress, favorites, and language preference are stored locally in the browser.",
      },
      {
        title: "Technical data and logs",
        body: "Hosting, API, or infrastructure providers may process technical data such as device information, request logs, IP address, browser type, timestamps, and error diagnostics.",
      },
      {
        title: "Analytics or hosting providers",
        body: "Pictoria may use hosting or analytics providers to operate, monitor, and improve the app. If analytics are added, this policy should be updated with the provider and data scope.",
      },
      {
        title: "Cookies and local storage",
        body: "Pictoria uses local storage for features such as favorites, quiz session state, and language preference. Cookies may be used if future hosting, analytics, authentication, or account features require them.",
      },
      {
        title: "Third-party services",
        body: "Pictoria may use services such as Vercel, Supabase, Cloudinary, Wikimedia, or museum/open-access sources where applicable for hosting, data storage, media delivery, or artwork source material.",
      },
      {
        title: "User rights and contact placeholder",
        body: "Depending on your location, you may have rights to request access, correction, deletion, or more information about personal data. Contact: contact channel coming soon.",
      },
      {
        title: "Future updates",
        body: "If accounts, authentication, cloud-synced favorites, rankings, payments, or additional user-generated features are added, this policy should be updated before those features are released.",
      },
    ],
  },
};

export default function PrivacyPage() {
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
