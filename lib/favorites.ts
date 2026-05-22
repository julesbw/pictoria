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

export function toggleFavoriteArtwork(artworkId: string) {
  const favoriteIds = getFavoriteIds();
  const nextIds = favoriteIds.includes(artworkId)
    ? favoriteIds.filter((id) => id !== artworkId)
    : [...favoriteIds, artworkId];

  return setFavoriteIds(nextIds);
}

export function subscribeToFavorites(listener: () => void) {
  window.addEventListener(favoritesChangedEvent, listener);
  window.addEventListener("storage", listener);

  return () => {
    window.removeEventListener(favoritesChangedEvent, listener);
    window.removeEventListener("storage", listener);
  };
}
