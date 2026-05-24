"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getFavoriteIds,
  getFavoriteIdsHybrid,
  setFavoriteIds,
  subscribeToFavorites,
  syncFavoriteIdsToSupabase,
} from "@/lib/favorites";

function toFavoriteSet(ids: string[]) {
  return new Set(ids);
}

function toggleFavoriteId(ids: Set<string>, artworkId: string) {
  const nextIds = new Set(ids);

  if (nextIds.has(artworkId)) {
    nextIds.delete(artworkId);
  } else {
    nextIds.add(artworkId);
  }

  return nextIds;
}

export function useFavorites() {
  const [favoriteIds, setFavoriteIdSet] = useState<Set<string>>(() =>
    toFavoriteSet(getFavoriteIds()),
  );
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getFavoriteIdsHybrid()
      .then((ids) => {
        if (cancelled) return;

        setFavoriteIdSet(toFavoriteSet(ids));
        setIsLoaded(true);
      })
      .catch(() => {
        if (cancelled) return;

        setFavoriteIdSet(toFavoriteSet(getFavoriteIds()));
        setIsLoaded(true);
      });

    const unsubscribe = subscribeToFavorites(() => {
      setFavoriteIdSet(toFavoriteSet(getFavoriteIds()));
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const toggleFavorite = useCallback(async (artworkId: string) => {
    setError(null);

    const previousIds = getFavoriteIds();
    const previousIdSet = toFavoriteSet(previousIds);
    const nextIdSet = toggleFavoriteId(previousIdSet, artworkId);
    const nextIds = Array.from(nextIdSet);

    setFavoriteIds(nextIds);
    setFavoriteIdSet(nextIdSet);

    try {
      await syncFavoriteIdsToSupabase(nextIds);
    } catch (syncError) {
      setFavoriteIds(previousIds);
      setFavoriteIdSet(previousIdSet);
      setError("No se pudieron sincronizar los favoritos.");
      throw syncError;
    }
  }, []);

  const value = useMemo(
    () => ({
      error,
      favoriteIds,
      isFavorite: (artworkId: string) => favoriteIds.has(artworkId),
      isLoaded,
      toggleFavorite,
    }),
    [error, favoriteIds, isLoaded, toggleFavorite],
  );

  return value;
}
