import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import imageCache from "../data/artwork-image-cache.json" with { type: "json" };
import seedArtworks from "../data/seed-artworks.json" with { type: "json" };

loadEnvFile(".env.local");

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.",
  );
  process.exit(1);
}

const supabase = createClient(normalizeSupabaseUrl(supabaseUrl), serviceRoleKey, {
  auth: { persistSession: false },
});

const artists = Array.from(
  new Map(
    seedArtworks
      .filter((artwork) => artwork.artist)
      .map((artwork) => [
        artwork.artist.id,
        {
          id: artwork.artist.id,
          name: artwork.artist.name,
          nationality: artwork.artist.nationality ?? null,
          birth_year: artwork.artist.birth_year ?? null,
          death_year: artwork.artist.death_year ?? null,
        },
      ]),
  ).values(),
);

const movements = Array.from(
  new Map(
    seedArtworks
      .filter((artwork) => artwork.movement)
      .map((artwork) => [
        artwork.movement.id,
        {
          id: artwork.movement.id,
          name: artwork.movement.name,
          theme_key: artwork.movement.theme_key,
          description: artwork.movement.description ?? null,
        },
      ]),
  ).values(),
);

const artworks = seedArtworks.map((artwork) => {
  const cachedImage = imageCache[artwork.id];
  const row = {
    id: artwork.id,
    title: artwork.title,
    artist_id: artwork.artist_id,
    movement_id: artwork.movement_id,
    year: artwork.year ?? null,
    image_url: artwork.image_url,
    wikimedia_file: artwork.wikimedia_file ?? null,
    description: artwork.description,
    museum: artwork.museum ?? null,
    source_image_url: artwork.source_image_url ?? cachedImage?.source_url ?? null,
    attribution: artwork.attribution ?? cachedImage?.attribution ?? cachedImage?.artist_credit ?? null,
    license: artwork.license ?? cachedImage?.license_short_name ?? null,
    difficulty: artwork.difficulty,
    public_domain: artwork.public_domain,
    source: artwork.source ?? null,
  };

  for (const key of [
    "cloudinary_public_id",
    "cloudinary_url",
    "thumbnail_url",
    "blur_data_url",
    "width",
    "height",
    "aspect_ratio",
  ]) {
    if (artwork[key] !== undefined) {
      row[key] = artwork[key];
    }
  }

  return row;
});

await upsert("artists", artists);
await upsert("movements", movements);
await upsert("artworks", artworks);

console.log(
  `Seeded ${artists.length} artists, ${movements.length} movements, and ${artworks.length} artworks.`,
);

async function upsert(table, rows) {
  const { error } = await supabase.from(table).upsert(rows, { onConflict: "id" });

  if (error) {
    console.error(`Failed to seed ${table}:`, error.message);
    process.exit(1);
  }
}

function normalizeSupabaseUrl(value) {
  const url = new URL(value);

  return `${url.protocol}//${url.host}`;
}

function loadEnvFile(path) {
  if (!existsSync(path)) return;

  const envFile = readFileSync(path, "utf8");

  for (const line of envFile.split(/\r?\n/)) {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith("#")) continue;

    const separatorIndex = trimmedLine.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmedLine.slice(0, separatorIndex).trim();
    const rawValue = trimmedLine.slice(separatorIndex + 1).trim();

    if (!key || process.env[key]) continue;

    process.env[key] = rawValue.replace(/^["']|["']$/g, "");
  }
}
