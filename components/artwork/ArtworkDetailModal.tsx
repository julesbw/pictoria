"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { ArtworkImage } from "@/components/artwork/ArtworkImage";
import { FavoriteButton } from "@/components/artwork/FavoriteButton";
import { useLanguage } from "@/components/language/LanguageProvider";
import {
  getLocalizedArtworkDescription,
  getLocalizedArtworkTitle,
  getLocalizedMovementName,
} from "@/lib/localization";
import { getArtTheme } from "@/lib/themes";
import { cn } from "@/lib/utils";
import type { Artwork } from "@/types";

interface ArtworkDetailModalProps {
  artwork: Artwork;
  open: boolean;
  onClose: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (artworkId: string) => void | Promise<void>;
}

export function ArtworkDetailModal({
  artwork,
  open,
  onClose,
  isFavorite,
  onToggleFavorite,
}: ArtworkDetailModalProps) {
  const { language } = useLanguage();
  const theme = getArtTheme(artwork.movement?.theme_key);
  const title = getLocalizedArtworkTitle(artwork, language);
  const movementName = getLocalizedMovementName(
    artwork.movement?.theme_key,
    artwork.movement?.name,
    language,
  );
  const description = getLocalizedArtworkDescription(artwork, language);
  const tip =
    language === "es"
      ? "Haz click en el nombre del autor para ver contexto, datos curiosos y obras relacionadas dentro de Pictoria."
      : "Click the artist name to see context, fun facts, and related artworks inside Pictoria.";

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={cn(
              "grid max-h-[92vh] w-full max-w-6xl overflow-hidden shadow-2xl lg:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.75fr)]",
              theme.card,
            )}
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className={cn("artwork-frame flex min-h-[45vh] items-center justify-center overflow-hidden p-3 sm:p-5 lg:min-h-[72vh]", theme.surface)}>
              <ArtworkImage
                artwork={artwork}
                eager
                fit="contain"
                withFiller
                className="max-h-[72vh] object-contain"
              />
            </div>

            <div className="flex max-h-[92vh] flex-col overflow-y-auto p-5 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className={cn("text-xs font-bold uppercase tracking-[0.16em]", theme.accent)}>
                    {movementName}
                  </p>
                  <h2 className="mt-2 font-serif text-3xl font-semibold leading-tight">
                    {title}
                  </h2>
                  <p className={cn("mt-2 text-sm", theme.muted)}>{artwork.year}</p>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-current/15 text-lg font-bold shadow-sm transition hover:scale-105",
                    theme.surface,
                  )}
                  aria-label="Cerrar detalle"
                >
                  ×
                </button>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href={`/artists/${artwork.artist_id}`}
                  className={cn(
                    "rounded-full border border-current/15 px-4 py-2 text-sm font-bold shadow-sm transition hover:scale-[1.02]",
                    theme.surface,
                  )}
                >
                  {artwork.artist?.name ?? (language === "es" ? "Artista desconocido" : "Unknown artist")}
                </Link>
                <FavoriteButton
                  artworkId={artwork.id}
                  isFavorite={isFavorite}
                  onToggleFavorite={onToggleFavorite}
                />
              </div>

              <p className={cn("mt-6 text-sm leading-7", theme.muted)}>
                {description}
              </p>

              <div className={cn("mt-6 rounded-2xl border border-current/15 p-4 text-sm lg:mt-auto", theme.surface)}>
                <p className={cn("font-bold", theme.accent)}>Tip</p>
                <p className={cn("mt-1", theme.muted)}>
                  {tip}
                </p>
              </div>
            </div>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
