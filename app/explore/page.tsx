"use client";

import { useMemo, useState } from "react";
import { ArtworkCard } from "@/components/artwork/ArtworkCard";
import { useLanguage } from "@/components/language/LanguageProvider";
import { AppShell } from "@/components/layout/AppShell";
import { artworks, filterArtworks, getArtists, getMovements } from "@/lib/artworks";
import { getLocalizedMovementName } from "@/lib/localization";
import type { Difficulty, MovementThemeKey } from "@/types";

const difficulties: Difficulty[] = ["easy", "medium", "hard"];

export default function ExplorePage() {
  const { language } = useLanguage();
  const [artistId, setArtistId] = useState("");
  const [movementKey, setMovementKey] = useState("");
  const [difficulty, setDifficulty] = useState("");

  const artists = useMemo(() => getArtists(), []);
  const movements = useMemo(() => getMovements(), []);
  const filteredArtworks = filterArtworks({
    artistId: artistId || undefined,
    movementKey: (movementKey || undefined) as MovementThemeKey | undefined,
    difficulty: (difficulty || undefined) as Difficulty | undefined,
  });
  const difficultyLabels: Record<Difficulty, string> =
    language === "es"
      ? { easy: "fácil", medium: "media", hard: "difícil" }
      : { easy: "easy", medium: "medium", hard: "hard" };
  const text =
    language === "es"
      ? {
          eyebrow: "Colección base",
          title: "Explora las obras del MVP",
          description:
            "Filtra por artista, movimiento o dificultad y guarda piezas para tu galería local.",
          count: "obras",
          artist: "Artista",
          movement: "Movimiento",
          difficulty: "Dificultad",
          all: "Todos",
          allFemale: "Todas",
        }
      : {
          eyebrow: "Base collection",
          title: "Explore the MVP artworks",
          description:
            "Filter by artist, movement, or difficulty and save pieces to your local gallery.",
          count: "artworks",
          artist: "Artist",
          movement: "Movement",
          difficulty: "Difficulty",
          all: "All",
          allFemale: "All",
        };

  return (
    <AppShell themeKey="modernism">
      <section className="space-y-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div className="max-w-2xl space-y-3">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-zinc-700">
              {text.eyebrow}
            </p>
            <h1 className="font-serif text-4xl font-semibold text-stone-950">
              {text.title}
            </h1>
            <p className="text-stone-700">
              {text.description}
            </p>
          </div>

          <p className="rounded-full bg-white px-4 py-2 text-sm font-bold text-stone-700 shadow-sm">
            {language === "es"
              ? `${filteredArtworks.length} de ${artworks.length} ${text.count}`
              : `${filteredArtworks.length} of ${artworks.length} ${text.count}`}
          </p>
        </div>

        <div className="grid gap-3 rounded-2xl border border-zinc-200 bg-white/75 p-4 shadow-sm md:grid-cols-3">
          <label className="grid gap-2 text-sm font-semibold text-stone-700">
            {text.artist}
            <select
              value={artistId}
              onChange={(event) => setArtistId(event.target.value)}
              className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-stone-950"
            >
              <option value="">{text.all}</option>
              {artists.map((artist) => (
                <option key={artist.id} value={artist.id}>
                  {artist.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-semibold text-stone-700">
            {text.movement}
            <select
              value={movementKey}
              onChange={(event) => setMovementKey(event.target.value)}
              className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-stone-950"
            >
              <option value="">{text.all}</option>
              {movements.map((movement) => (
                <option key={movement.id} value={movement.theme_key}>
                  {getLocalizedMovementName(movement.theme_key, movement.name, language)}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-semibold text-stone-700">
            {text.difficulty}
            <select
              value={difficulty}
              onChange={(event) => setDifficulty(event.target.value)}
              className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-stone-950"
            >
              <option value="">{text.allFemale}</option>
              {difficulties.map((item) => (
                <option key={item} value={item}>
                  {difficultyLabels[item]}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredArtworks.map((artwork) => (
            <ArtworkCard key={artwork.id} artwork={artwork} showDescription />
          ))}
        </div>
      </section>
    </AppShell>
  );
}
