"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArtworkCard } from "@/components/artwork/ArtworkCard";
import { useLanguage } from "@/components/language/LanguageProvider";
import { AppShell } from "@/components/layout/AppShell";
import { artworks, getArtworksHybrid } from "@/lib/artworks";
import { useFavorites } from "@/lib/use-favorites";

export default function GalleryPage() {
  const { language } = useLanguage();
  const [catalogArtworks, setCatalogArtworks] = useState(artworks);
  const [artworksLoaded, setArtworksLoaded] = useState(false);
  const {
    error: favoriteError,
    favoriteIds,
    isFavorite,
    isLoaded: favoritesLoaded,
    toggleFavorite,
  } = useFavorites();

  useEffect(() => {
    let cancelled = false;

    getArtworksHybrid().then((nextArtworks) => {
      if (!cancelled) {
        setCatalogArtworks(nextArtworks);
        setArtworksLoaded(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const favorites = catalogArtworks.filter((artwork) => favoriteIds.has(artwork.id));
  const isLoaded = artworksLoaded && favoritesLoaded;
  const text =
    language === "es"
      ? {
          eyebrow: "Galería local",
          title: "Tus obras favoritas",
          description:
            "Esta colección vive temporalmente en `localStorage`. Más adelante puede migrarse a Supabase sin cambiar la experiencia principal.",
          emptyTitle: "Tu galería está vacía",
          emptyDescription:
            "Guarda obras desde el quiz o desde explorar. Aparecerán aquí al instante y podrás quitarlas con el botón de corazón.",
          favoriteSyncError: "No se pudieron sincronizar los favoritos. Inténtalo de nuevo.",
        }
      : {
          eyebrow: "Local gallery",
          title: "Your favorite artworks",
          description:
            "This collection temporarily lives in `localStorage`. Later it can move to Supabase without changing the core experience.",
          emptyTitle: "Your gallery is empty",
          emptyDescription:
            "Save artworks from the quiz or Explore. They will appear here instantly, and you can remove them with the heart button.",
          favoriteSyncError: "Favorites could not be synced. Try again.",
        };

  return (
    <AppShell themeKey="renaissance">
      <section className="space-y-6">
        <div className="max-w-2xl space-y-3">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-amber-800">
            {text.eyebrow}
          </p>
          <h1 className="font-serif text-4xl font-semibold text-stone-950">
            {text.title}
          </h1>
          <p className="text-stone-700">
            {text.description}
          </p>
        </div>

        {favoriteError ? (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {text.favoriteSyncError}
          </p>
        ) : null}

        {!isLoaded ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-80 animate-pulse rounded-2xl border border-amber-700/10 bg-white/50"
              />
            ))}
          </div>
        ) : favorites.length > 0 ? (
          <motion.div
            layout
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {favorites.map((artwork) => (
              <motion.div
                key={artwork.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
              >
                <ArtworkCard
                  artwork={artwork}
                  showDescription
                  isFavorite={isFavorite(artwork.id)}
                  onToggleFavorite={toggleFavorite}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-dashed border-amber-700/40 bg-white/75 p-8 text-stone-700 shadow-sm"
          >
            <h2 className="font-serif text-2xl font-semibold text-stone-950">
              {text.emptyTitle}
            </h2>
            <p className="mt-2 max-w-xl leading-7">
              {text.emptyDescription}
            </p>
          </motion.div>
        )}
      </section>
    </AppShell>
  );
}
