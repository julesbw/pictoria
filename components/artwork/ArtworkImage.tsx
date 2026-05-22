"use client";

import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/components/language/LanguageProvider";
import { getLocalizedArtworkTitle } from "@/lib/localization";
import { getArtTheme } from "@/lib/themes";
import { cn } from "@/lib/utils";
import type { Artwork } from "@/types";

interface ArtworkImageProps {
  artwork: Artwork;
  eager?: boolean;
  className?: string;
  fit?: "cover" | "contain";
  withFiller?: boolean;
}

export function ArtworkImage({
  artwork,
  eager = false,
  className,
  fit = "cover",
  withFiller = false,
}: ArtworkImageProps) {
  const { language } = useLanguage();
  const candidates = useMemo(
    () => [`/api/artworks/${artwork.id}/image`, artwork.image_url],
    [artwork.id, artwork.image_url],
  );
  const [imageIndex, setImageIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const theme = getArtTheme(artwork.movement?.theme_key);
  const failed = imageIndex >= candidates.length;
  const title = getLocalizedArtworkTitle(artwork, language);

  useEffect(() => {
    setImageIndex(0);
    setIsLoaded(false);
  }, [artwork.id, artwork.image_url]);

  if (failed) {
    return (
      <div
        className={cn(
          "flex h-full min-h-64 w-full flex-col items-center justify-center gap-3 p-6 text-center",
          theme.surface,
          className,
        )}
      >
        <p className={cn("text-xs font-bold uppercase tracking-[0.16em]", theme.accent)}>
          Imagen no disponible
        </p>
        <div>
          <p className="font-serif text-2xl font-semibold">{title}</p>
          <p className={cn("mt-1 text-sm", theme.muted)}>{artwork.artist?.name}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      {!isLoaded ? (
        <div className={cn("absolute inset-0 animate-pulse", theme.surface)} />
      ) : null}
      {withFiller ? (
        <div className="artwork-frame absolute inset-0" />
      ) : null}
      {/* Wikimedia responde 429 con frecuencia al optimizador de Next en local. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={candidates[imageIndex]}
        alt={title}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        referrerPolicy="no-referrer"
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setIsLoaded(false);
          setImageIndex((current) => current + 1);
        }}
        className={cn(
          "relative z-10 h-full w-full transition duration-500",
          fit === "contain" ? "object-contain" : "object-cover",
          className,
        )}
      />
    </div>
  );
}
