"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { Artist } from "@/types";

interface ArtistPortraitProps {
  artist: Artist;
  className?: string;
}

export function ArtistPortrait({ artist, className }: ArtistPortraitProps) {
  const candidates = useMemo(
    () => [artist.image_url].filter(Boolean) as string[],
    [artist.image_url],
  );
  const [imageIndex, setImageIndex] = useState(0);
  const currentImage = candidates[imageIndex];

  useEffect(() => {
    setImageIndex(0);
  }, [artist.id, candidates.length]);

  if (!currentImage) {
    return (
      <div
        className={cn(
          "flex aspect-[4/5] w-full max-w-sm items-center justify-center overflow-hidden rounded-xl bg-zinc-200 text-center shadow-sm",
          className,
        )}
      >
        <span className="font-serif text-7xl font-semibold text-stone-500">
          {artist.name.slice(0, 1)}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex aspect-[4/5] w-full max-w-sm items-center justify-center overflow-hidden rounded-xl bg-zinc-200 p-3 shadow-sm",
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={currentImage}
        alt={artist.name}
        loading="eager"
        decoding="async"
        referrerPolicy="no-referrer"
        className="max-h-full max-w-full object-contain"
        onError={() => setImageIndex((current) => current + 1)}
      />
    </div>
  );
}
