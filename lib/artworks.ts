import seedArtworks from "@/data/seed-artworks.json";
import { artistProfiles } from "@/lib/artist-profiles";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Artwork, Difficulty, MovementThemeKey } from "@/types";

export const artworks = seedArtworks as Artwork[];

type SupabaseArtworkRow = {
  id: string;
  title: string;
  artist_id: string;
  movement_id: string;
  year: string | null;
  image_url: string;
  wikimedia_file: string | null;
  description: string;
  museum: string | null;
  source_image_url: string | null;
  cloudinary_public_id: string | null;
  cloudinary_url: string | null;
  thumbnail_url: string | null;
  blur_data_url: string | null;
  width: number | null;
  height: number | null;
  aspect_ratio: number | null;
  attribution: string | null;
  license: string | null;
  difficulty: Difficulty;
  public_domain: boolean;
  source: string | null;
  artist: {
    id: string;
    name: string;
    nationality: string | null;
    birth_year: number | null;
    death_year: number | null;
    bio: string | null;
    fun_fact: string | null;
    image_url: string | null;
  } | null;
  movement: {
    id: string;
    name: string;
    description: string | null;
    theme_key: string;
  } | null;
};

export function getRandomArtworks(count: number) {
  const shuffled = [...artworks];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled.slice(0, count);
}

export async function getArtworksHybrid() {
  const remoteArtworks = await getArtworksFromSupabase();

  return remoteArtworks.length > 0 ? remoteArtworks : artworks;
}

export async function getRandomArtworksHybrid(count: number) {
  return getRandomArtworksFrom(await getArtworksHybrid(), count);
}

export function getRandomArtworksFrom(sourceArtworks: Artwork[], count: number) {
  const shuffled = [...sourceArtworks];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled.slice(0, count);
}

export function getArtworkById(id: string) {
  return artworks.find((artwork) => artwork.id === id);
}

export function getArtists(sourceArtworks: Artwork[] = artworks) {
  return Array.from(
    new Map(
      sourceArtworks
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

export function getMovements(sourceArtworks: Artwork[] = artworks) {
  return Array.from(
    new Map(
      sourceArtworks
        .filter((artwork) => artwork.movement)
        .map((artwork) => [artwork.movement!.id, artwork.movement!]),
    ).values(),
  );
}

export function filterArtworks(filters: {
  artistId?: string;
  movementKey?: MovementThemeKey;
  difficulty?: Difficulty;
}, sourceArtworks: Artwork[] = artworks) {
  return sourceArtworks.filter((artwork) => {
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

async function getArtworksFromSupabase() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from("artworks")
      .select("*, artist:artists(*), movement:movements(*)")
      .order("title", { ascending: true });

    if (error || !data) return [];

    return (data as SupabaseArtworkRow[]).map(mapSupabaseArtwork);
  } catch {
    return [];
  }
}

function mapSupabaseArtwork(row: SupabaseArtworkRow): Artwork {
  return {
    id: row.id,
    title: row.title,
    artist_id: row.artist_id,
    movement_id: row.movement_id,
    year: row.year ?? undefined,
    image_url: row.image_url,
    wikimedia_file: row.wikimedia_file ?? undefined,
    description: row.description,
    museum: row.museum ?? undefined,
    source_image_url: row.source_image_url ?? undefined,
    cloudinary_public_id: row.cloudinary_public_id ?? undefined,
    cloudinary_url: row.cloudinary_url ?? undefined,
    thumbnail_url: row.thumbnail_url ?? undefined,
    blur_data_url: row.blur_data_url ?? undefined,
    width: row.width ?? undefined,
    height: row.height ?? undefined,
    aspect_ratio: row.aspect_ratio ?? undefined,
    attribution: row.attribution ?? undefined,
    license: row.license ?? undefined,
    difficulty: row.difficulty,
    public_domain: row.public_domain,
    source: row.source ?? undefined,
    artist: row.artist
      ? {
          id: row.artist.id,
          name: row.artist.name,
          nationality: row.artist.nationality ?? undefined,
          birth_year: row.artist.birth_year ?? undefined,
          death_year: row.artist.death_year ?? undefined,
          bio: row.artist.bio ?? undefined,
          fun_fact: row.artist.fun_fact ?? undefined,
          image_url: row.artist.image_url ?? undefined,
          ...artistProfiles[row.artist.id],
        }
      : undefined,
    movement: row.movement
      ? {
          id: row.movement.id,
          name: row.movement.name,
          description: row.movement.description ?? undefined,
          theme_key: row.movement.theme_key as MovementThemeKey,
        }
      : undefined,
  };
}
