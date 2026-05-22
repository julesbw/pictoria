"use client";

import {
  getLocalizedMovementName,
  getLocalizedNationality,
} from "@/lib/localization";
import { useLanguage } from "@/components/language/LanguageProvider";
import type { Artist, Movement } from "@/types";

interface ArtistProfileSummaryProps {
  artist: Artist;
  lifespan: string;
  movements: Movement[];
}

export function ArtistProfileSummary({
  artist,
  lifespan,
  movements,
}: ArtistProfileSummaryProps) {
  const { language } = useLanguage();
  const nationality = getLocalizedNationality(artist.nationality, language);
  const pendingBio =
    language === "es"
      ? "Ficha de contexto pendiente para este autor."
      : "Context profile pending for this artist.";

  return (
    <>
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-stone-600">
        {language === "es" ? "Autor" : "Artist"}
      </p>
      <h1 className="mt-2 font-serif text-5xl font-semibold leading-tight text-stone-950">
        {artist.name}
      </h1>
      <p className="mt-3 text-sm font-semibold text-stone-600">
        {[nationality, lifespan].filter(Boolean).join(" · ")}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {movements.map((movement) => (
          <span
            key={movement.id}
            className="rounded-full bg-stone-950/5 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-stone-700"
          >
            {getLocalizedMovementName(movement.theme_key, movement.name, language)}
          </span>
        ))}
      </div>

      <p className="mt-6 text-base leading-8 text-stone-700">
        {artist.bio ?? pendingBio}
      </p>

      {artist.fun_fact ? (
        <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone-500">
            {language === "es" ? "Dato curioso" : "Fun fact"}
          </p>
          <p className="mt-2 text-sm leading-6 text-stone-700">{artist.fun_fact}</p>
        </div>
      ) : null}
    </>
  );
}
