"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useLanguage } from "@/components/language/LanguageProvider";
import {
  getFavoriteIdsHybrid,
  subscribeToFavorites,
  toggleFavoriteArtworkHybrid,
} from "@/lib/favorites";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  artworkId: string;
  className?: string;
  compact?: boolean;
}

export function FavoriteButton({ artworkId, className, compact = false }: FavoriteButtonProps) {
  const { language } = useLanguage();
  const [isFavorite, setIsFavorite] = useState(false);
  const labels =
    language === "es"
      ? { remove: "Quitar de favoritos", add: "Guardar en favoritos", saved: "Guardada", save: "Guardar" }
      : { remove: "Remove from favorites", add: "Save to favorites", saved: "Saved", save: "Save" };

  useEffect(() => {
    let cancelled = false;

    function syncFavoriteState() {
      getFavoriteIdsHybrid().then((favoriteIds) => {
        if (!cancelled) {
          setIsFavorite(favoriteIds.includes(artworkId));
        }
      });
    }

    syncFavoriteState();
    const unsubscribe = subscribeToFavorites(syncFavoriteState);

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [artworkId]);

  function toggleFavorite() {
    toggleFavoriteArtworkHybrid(artworkId).then((nextFavorites) => {
      setIsFavorite(nextFavorites.includes(artworkId));
    });
  }

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.94 }}
      onClick={toggleFavorite}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full border border-stone-950/10 bg-white/80 px-4 py-2 text-sm font-semibold text-stone-950 shadow-sm transition hover:bg-white",
        isFavorite && "border-rose-300 bg-rose-50 text-rose-700",
        compact && "h-10 w-10 px-0",
        className,
      )}
      aria-pressed={isFavorite}
      aria-label={isFavorite ? labels.remove : labels.add}
    >
      <span aria-hidden="true">{isFavorite ? "♥" : "♡"}</span>
      {compact ? null : <span>{isFavorite ? labels.saved : labels.save}</span>}
    </motion.button>
  );
}
