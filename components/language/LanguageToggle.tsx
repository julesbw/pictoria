"use client";

import { languageLabels, type Language } from "@/lib/localization";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/language/LanguageProvider";

const languages: Language[] = ["es", "en"];

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className="inline-flex rounded-full border border-stone-950/10 bg-white/75 p-1 shadow-sm"
      aria-label="Elegir idioma"
    >
      {languages.map((item) => {
        const active = item === language;

        return (
          <button
            key={item}
            type="button"
            onClick={() => setLanguage(item)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-bold transition",
              active
                ? "bg-stone-950 text-white shadow-sm"
                : "text-stone-600 hover:bg-stone-950/5 hover:text-stone-950",
            )}
            aria-pressed={active}
          >
            {languageLabels[item]}
          </button>
        );
      })}
    </div>
  );
}
