import Link from "next/link";
import { notFound } from "next/navigation";
import { ArtistPortrait } from "@/components/artist/ArtistPortrait";
import { ArtistProfileSummary } from "@/components/artist/ArtistProfileSummary";
import { ArtworkCard } from "@/components/artwork/ArtworkCard";
import { AppShell } from "@/components/layout/AppShell";
import {
  getArtistById,
  getArtists,
  getArtworksByArtistId,
  getPrimaryMovementThemeForArtist,
} from "@/lib/artworks";

interface ArtistPageProps {
  params: {
    id: string;
  };
}

export function generateStaticParams() {
  return getArtists().map((artist) => ({
    id: artist.id,
  }));
}

export function generateMetadata({ params }: ArtistPageProps) {
  const artist = getArtistById(params.id);

  return {
    title: artist ? `${artist.name} | Pictoria` : "Autor | Pictoria",
  };
}

export default function ArtistPage({ params }: ArtistPageProps) {
  const artist = getArtistById(params.id);

  if (!artist) {
    notFound();
  }

  const artistArtworks = getArtworksByArtistId(artist.id);
  const themeKey = getPrimaryMovementThemeForArtist(artist.id) ?? "modernism";
  const lifespan = [artist.birth_year, artist.death_year].filter(Boolean).join(" - ");
  const movements = Array.from(
    new Map(
      artistArtworks
        .filter((artwork) => artwork.movement)
        .map((artwork) => [artwork.movement!.id, artwork.movement!]),
    ).values(),
  );

  return (
    <AppShell themeKey={themeKey}>
      <section className="space-y-8">
        <Link
          href="/explore"
          className="inline-flex rounded-full border border-stone-950/10 bg-white/75 px-4 py-2 text-sm font-bold text-stone-800 shadow-sm transition hover:bg-white"
        >
          Volver a explorar
        </Link>

        <div className="grid overflow-hidden rounded-2xl border border-zinc-200 bg-white/80 shadow-artwork lg:grid-cols-[minmax(280px,0.85fr)_minmax(0,1.15fr)]">
          <div className="flex items-center justify-center bg-zinc-100 p-6 sm:p-8">
            <ArtistPortrait artist={artist} />
          </div>

          <div className="flex flex-col justify-center p-6 sm:p-8">
            <ArtistProfileSummary
              artist={artist}
              lifespan={lifespan}
              movements={movements}
            />
          </div>
        </div>

        <section className="space-y-4">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-stone-600">
                Obras en Pictoria
              </p>
              <h2 className="font-serif text-3xl font-semibold text-stone-950">
                Galería de {artist.name}
              </h2>
            </div>
            <p className="rounded-full bg-white/80 px-4 py-2 text-sm font-bold text-stone-700 shadow-sm">
              {artistArtworks.length} {artistArtworks.length === 1 ? "obra" : "obras"}
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {artistArtworks.map((artwork) => (
              <ArtworkCard key={artwork.id} artwork={artwork} showDescription />
            ))}
          </div>
        </section>
      </section>
    </AppShell>
  );
}
