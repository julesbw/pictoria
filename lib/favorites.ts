import { getSupabaseUserId } from "@/lib/supabase/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const storageKey = "pictoria:favorites";
export const favoritesChangedEvent = "pictoria:favorites-changed";

function normalizeFavoriteIds(value: unknown) {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value.filter((item): item is string => typeof item === "string")));
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
  const nextIds = normalizeFavoriteIds(ids);
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
    await syncFavoriteIdsToSupabase(localIds);
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
  const nextIds = toggleFavoriteArtwork(artworkId);

  await syncFavoriteIdsToSupabase(nextIds);
  return nextIds;
}

export function subscribeToFavorites(listener: () => void) {
  window.addEventListener(favoritesChangedEvent, listener);
  window.addEventListener("storage", listener);

  return () => {
    window.removeEventListener(favoritesChangedEvent, listener);
    window.removeEventListener("storage", listener);
  };
}

async function getFavoriteIdsFromSupabase() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  try {
    const userId = await getSupabaseUserId();
    if (!userId) return null;

    const { data, error } = await supabase
      .from("favorites")
      .select("artwork_id")
      .eq("user_id", userId);

    if (error) return null;

    return normalizeFavoriteIds(data.map((favorite) => favorite.artwork_id));
  } catch {
    return null;
  }
}

async function syncFavoriteIdsToSupabase(ids: string[]) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;

  try {
    const userId = await getSupabaseUserId();
    if (!userId) return;

    const remoteIds = await getFavoriteIdsFromSupabase();
    if (!remoteIds) return;

    const nextIds = normalizeFavoriteIds(ids);
    const nextIdSet = new Set(nextIds);
    const idsToRemove = remoteIds.filter((id) => !nextIdSet.has(id));
    const rowsToAdd = nextIds
      .filter((id) => !remoteIds.includes(id))
      .map((artworkId) => ({ user_id: userId, artwork_id: artworkId }));

    if (idsToRemove.length > 0) {
      await supabase
        .from("favorites")
        .delete()
        .eq("user_id", userId)
        .in("artwork_id", idsToRemove);
    }

    if (rowsToAdd.length > 0) {
      await supabase.from("favorites").upsert(rowsToAdd, {
        onConflict: "user_id,artwork_id",
      });
    }
  } catch {
    // Keep localStorage as the source of truth until Supabase is reachable.
  }
}
