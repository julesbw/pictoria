import { getSupabaseUserId } from "@/lib/supabase/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const storageKey = "pictoria:favorites";
export const favoritesChangedEvent = "pictoria:favorites-changed";

function normalizeFavoriteIds(value: unknown) {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value.filter((item): item is string => typeof item === "string")));
}

function areFavoriteIdsEqual(left: string[], right: string[]) {
  if (left.length !== right.length) return false;

  const rightIds = new Set(right);
  return left.every((id) => rightIds.has(id));
}

export function getFavoriteIds() {
  if (typeof window === "undefined") return [];

  try {
    const stored = window.localStorage.getItem(storageKey);
    return normalizeFavoriteIds(stored ? JSON.parse(stored) : []);
  } catch {
    return [];
  }
}

export function isFavoriteArtwork(artworkId: string) {
  return getFavoriteIds().includes(artworkId);
}

export function setFavoriteIds(ids: string[]) {
  const currentIds = getFavoriteIds();
  const nextIds = normalizeFavoriteIds(ids);

  if (areFavoriteIdsEqual(currentIds, nextIds)) {
    return nextIds;
  }

  window.localStorage.setItem(storageKey, JSON.stringify(nextIds));
  window.dispatchEvent(new CustomEvent(favoritesChangedEvent));
  return nextIds;
}

export async function getFavoriteIdsHybrid() {
  const localIds = getFavoriteIds();
  const remoteIds = await getFavoriteIdsFromSupabase();

  if (!remoteIds) {
    return localIds;
  }

  if (localIds.length > 0 && remoteIds.length === 0) {
    try {
      await syncFavoriteIdsToSupabase(localIds);
    } catch {
      // Keep localStorage as the source of truth until Supabase is reachable.
    }
    return localIds;
  }

  setFavoriteIds(remoteIds);
  return remoteIds;
}

export function toggleFavoriteArtwork(artworkId: string) {
  const favoriteIds = getFavoriteIds();
  const nextIds = favoriteIds.includes(artworkId)
    ? favoriteIds.filter((id) => id !== artworkId)
    : [...favoriteIds, artworkId];

  return setFavoriteIds(nextIds);
}

export async function toggleFavoriteArtworkHybrid(artworkId: string) {
  const previousIds = getFavoriteIds();
  const nextIds = previousIds.includes(artworkId)
    ? previousIds.filter((id) => id !== artworkId)
    : [...previousIds, artworkId];

  setFavoriteIds(nextIds);

  try {
    await syncFavoriteIdsToSupabase(nextIds);
    return nextIds;
  } catch (error) {
    setFavoriteIds(previousIds);
    throw error;
  }
}

export function subscribeToFavorites(listener: () => void) {
  window.addEventListener(favoritesChangedEvent, listener);
  window.addEventListener("storage", listener);

  return () => {
    window.removeEventListener(favoritesChangedEvent, listener);
    window.removeEventListener("storage", listener);
  };
}

async function getFavoriteIdsFromSupabase(options: { throwOnError?: boolean } = {}) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  try {
    const userId = await getSupabaseUserId();
    if (!userId) return null;

    const { data, error } = await supabase
      .from("favorites")
      .select("artwork_id")
      .eq("user_id", userId);

    if (error) {
      if (options.throwOnError) throw error;
      return null;
    }

    return normalizeFavoriteIds(data.map((favorite) => favorite.artwork_id));
  } catch (error) {
    if (options.throwOnError) throw error;
    return null;
  }
}

export async function syncFavoriteIdsToSupabase(ids: string[]) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;

  const userId = await getSupabaseUserId();
  if (!userId) return;

  const remoteIds = await getFavoriteIdsFromSupabase({ throwOnError: true });
  if (!remoteIds) return;

  const nextIds = normalizeFavoriteIds(ids);
  const nextIdSet = new Set(nextIds);
  const idsToRemove = remoteIds.filter((id) => !nextIdSet.has(id));
  const rowsToAdd = nextIds
    .filter((id) => !remoteIds.includes(id))
    .map((artworkId) => ({ user_id: userId, artwork_id: artworkId }));

  if (idsToRemove.length > 0) {
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", userId)
      .in("artwork_id", idsToRemove);

    if (error) throw error;
  }

  if (rowsToAdd.length > 0) {
    const { error } = await supabase.from("favorites").upsert(rowsToAdd, {
      onConflict: "user_id,artwork_id",
    });

    if (error) throw error;
  }
}
