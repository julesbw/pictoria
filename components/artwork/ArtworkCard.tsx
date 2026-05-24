"use client";

import { useState } from "react";
import { FavoriteButton } from "@/components/artwork/FavoriteButton";
import { ArtworkDetailModal } from "@/components/artwork/ArtworkDetailModal";
import { ArtworkImage } from "@/components/artwork/ArtworkImage";
import { useLanguage } from "@/components/language/LanguageProvider";
import {
  getLocalizedArtworkDescription,
  getLocalizedArtworkTitle,
  getLocalizedMovementName,
} from "@/lib/localization";
import { getArtTheme } from "@/lib/themes";
import { cn } from "@/lib/utils";
import type { Artwork } from "@/types";

interface ArtworkCardProps {
  artwork: Artwork;
  showDescription?: boolean;
  enableHoverEffects?: boolean;
  enableDetailModal?: boolean;
  showFavoriteButton?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (artworkId: string) => void | Promise<void>;
}

export function ArtworkCard({
  artwork,
  showDescription = false,
  enableHoverEffects = true,
  enableDetailModal = true,
  showFavoriteButton = true,
  isFavorite,
  onToggleFavorite,
}: ArtworkCardProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const { language } = useLanguage();
  const theme = getArtTheme(artwork.movement?.theme_key);
  const title = getLocalizedArtworkTitle(artwork, language);
  const movementName = getLocalizedMovementName(
    artwork.movement?.theme_key,
    artwork.movement?.name,
    language,
  );
  const description = getLocalizedArtworkDescription(artwork, language);

  return (
    <>
      <article
        className={cn(
          "overflow-hidden transition duration-300",
          enableDetailModal ? "cursor-pointer" : "",
          enableHoverEffects ? "hover:-translate-y-1 hover:shadow-2xl" : "",
          theme.card,
        )}
        onClick={() => {
          if (enableDetailModal) {
            setDetailOpen(true);
          }
        }}
      >
        <div className="artwork-frame relative aspect-[4/3] w-full overflow-hidden">
          <ArtworkImage
            artwork={artwork}
            className={cn(
              "transition duration-500",
              enableHoverEffects ? "hover:scale-[1.03]" : "",
            )}
          />
        </div>
        <div className="space-y-3 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className={cn("text-xs font-bold uppercase tracking-[0.16em]", theme.accent)}>
                {movementName}
              </p>
              <h2 className="mt-1 font-serif text-xl font-semibold">{title}</h2>
              <p className={cn("text-sm", theme.muted)}>
                {artwork.artist?.name} · {artwork.year}
              </p>
            </div>
            {showFavoriteButton ? (
              <div onClick={(event) => event.stopPropagation()}>
                <FavoriteButton
                  artworkId={artwork.id}
                  compact
                  isFavorite={isFavorite}
                  onToggleFavorite={onToggleFavorite}
                />
              </div>
            ) : null}
          </div>
          {showDescription ? (
            <p className={cn("text-sm leading-6", theme.muted)}>{description}</p>
          ) : null}
        </div>
      </article>

      {enableDetailModal ? (
        <ArtworkDetailModal
          artwork={artwork}
          open={detailOpen}
          onClose={() => setDetailOpen(false)}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
        />
      ) : null}
    </>
  );
}
