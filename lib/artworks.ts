import seedArtworks from "@/data/seed-artworks.json";
import { artistProfiles } from "@/lib/artist-profiles";
import type { Artwork, Difficulty, MovementThemeKey } from "@/types";

export const artworks = seedArtworks as Artwork[];

export function getRandomArtworks(count: number) {
  const shuffled = [...artworks];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled.slice(0, count);
}

export function getArtworkById(id: string) {
  return artworks.find((artwork) => artwork.id === id);
}

export function getArtists() {
  return Array.from(
    new Map(
      artworks
        .filter((artwork) => artwork.artist)
        .map((artwork) => [
          artwork.artist!.id,
          {
            ...artwork.artist!,
            ...artistProfiles[artwork.artist!.id],
          },
        ]),
    ).values(),
  );
}

export function getArtistById(id: string) {
  return getArtists().find((artist) => artist.id === id);
}

export function getArtworksByArtistId(id: string) {
  return artworks.filter((artwork) => artwork.artist_id === id);
}

export function getPrimaryMovementThemeForArtist(id: string): MovementThemeKey | undefined {
  const artistArtworks = getArtworksByArtistId(id);
  const movementCounts = new Map<MovementThemeKey, number>();

  for (const artwork of artistArtworks) {
    const themeKey = artwork.movement?.theme_key;
    if (themeKey) {
      movementCounts.set(themeKey, (movementCounts.get(themeKey) ?? 0) + 1);
    }
  }

  return Array.from(movementCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0];
}

export function getMovements() {
  return Array.from(
    new Map(
      artworks
        .filter((artwork) => artwork.movement)
        .map((artwork) => [artwork.movement!.id, artwork.movement!]),
    ).values(),
  );
}

export function filterArtworks(filters: {
  artistId?: string;
  movementKey?: MovementThemeKey;
  difficulty?: Difficulty;
}) {
  return artworks.filter((artwork) => {
    const artistMatches = filters.artistId
      ? artwork.artist_id === filters.artistId
      : true;
    const movementMatches = filters.movementKey
      ? artwork.movement?.theme_key === filters.movementKey
      : true;
    const difficultyMatches = filters.difficulty
      ? artwork.difficulty === filters.difficulty
      : true;

    return artistMatches && movementMatches && difficultyMatches;
  });
}
