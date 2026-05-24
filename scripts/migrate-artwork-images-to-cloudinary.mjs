import { createClient } from "@supabase/supabase-js";
import { v2 as cloudinary } from "cloudinary";
import { existsSync, readFileSync } from "node:fs";
import { promises as fs } from "node:fs";
import path from "node:path";
import imageCache from "../data/artwork-image-cache.json" with { type: "json" };
import seedArtworks from "../data/seed-artworks.json" with { type: "json" };

const rootDir = process.cwd();
const outputPath = path.join(rootDir, "data", "cloudinary-artwork-migration.json");
const cloudinaryFolder = "pictoria/artworks";
const shouldUpsertSupabase = process.argv.includes("--upsert-supabase");
const shouldSyncSupabase = process.argv.includes("--sync-supabase");
const shouldUpdateSupabase = shouldUpsertSupabase || shouldSyncSupabase;

loadEnvFile(".env.local");

if (!shouldSyncSupabase) {
  configureCloudinary();
}

const supabase = shouldUpdateSupabase ? createSupabaseClient() : null;
const migrated = [];

if (supabase) {
  await assertSupabaseArtworkImageSchema(supabase);
}

if (shouldSyncSupabase) {
  await syncManifestToSupabase(supabase);
  process.exit(0);
}

for (const artwork of seedArtworks) {
  const localImagePath = getLocalImagePath(artwork);

  if (!localImagePath) {
    console.log(`SKIP ${artwork.title}: local image not found`);
    continue;
  }

  const upload = await cloudinary.uploader.upload(localImagePath, {
    folder: cloudinaryFolder,
    public_id: artwork.id,
    overwrite: true,
    resource_type: "image",
    use_filename: false,
  });
  const thumbnailUrl = cloudinary.url(upload.public_id, {
    secure: true,
    transformation: [
      {
        crop: "limit",
        fetch_format: "auto",
        quality: "auto",
        width: 960,
      },
    ],
  });
  const blurUrl = cloudinary.url(upload.public_id, {
    secure: true,
    transformation: [
      {
        crop: "limit",
        effect: "blur:1000",
        fetch_format: "auto",
        quality: "auto:low",
        width: 24,
      },
    ],
  });
  const blurDataUrl = await fetchDataUrl(blurUrl);
  const cachedImage = imageCache[artwork.id];
  const record = {
    id: artwork.id,
    source_image_url: artwork.source_image_url ?? cachedImage?.source_url ?? null,
    cloudinary_public_id: upload.public_id,
    cloudinary_url: upload.secure_url,
    thumbnail_url: thumbnailUrl,
    blur_data_url: blurDataUrl,
    width: upload.width ?? null,
    height: upload.height ?? null,
    aspect_ratio: upload.width && upload.height ? upload.width / upload.height : null,
    attribution: artwork.attribution ?? cachedImage?.attribution ?? cachedImage?.artist_credit ?? null,
    license: artwork.license ?? cachedImage?.license_short_name ?? null,
  };

  migrated.push(record);

  if (supabase) {
    await updateSupabaseArtworkImage(supabase, record);
  }

  await writeOutput(migrated);
  console.log(`OK ${artwork.title}`);
}

await writeOutput(migrated);
console.log(
  shouldUpsertSupabase
    ? `Uploaded and updated ${migrated.length} artwork images.`
    : `Uploaded ${migrated.length} artwork images. Review ${path.relative(rootDir, outputPath)} before Supabase update.`,
);

function configureCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.error("Missing CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, or CLOUDINARY_API_SECRET.");
    process.exit(1);
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

function createSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
    process.exit(1);
  }

  return createClient(normalizeSupabaseUrl(supabaseUrl), serviceRoleKey, {
    auth: { persistSession: false },
  });
}

function getLocalImagePath(artwork) {
  const cachedImage = imageCache[artwork.id];
  const candidates = [cachedImage?.storage_path, artwork.image_url ? `public${artwork.image_url}` : null]
    .filter(Boolean)
    .map((candidate) => path.join(rootDir, candidate));

  return candidates.find((candidate) => existsSync(candidate)) ?? null;
}

async function fetchDataUrl(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch blur image with ${response.status}.`);
  }

  const contentType = response.headers.get("content-type") ?? "image/jpeg";
  const buffer = Buffer.from(await response.arrayBuffer());

  return `data:${contentType};base64,${buffer.toString("base64")}`;
}

async function writeOutput(records) {
  await fs.writeFile(outputPath, `${JSON.stringify(records, null, 2)}\n`);
}

async function syncManifestToSupabase(supabaseClient) {
  if (!supabaseClient) {
    throw new Error("Supabase client is required for --sync-supabase.");
  }

  if (!existsSync(outputPath)) {
    throw new Error(`Missing migration manifest at ${path.relative(rootDir, outputPath)}.`);
  }

  const records = JSON.parse(await fs.readFile(outputPath, "utf8"));

  if (!Array.isArray(records)) {
    throw new Error("Cloudinary migration manifest must be a JSON array.");
  }

  for (const record of records) {
    await updateSupabaseArtworkImage(supabaseClient, record);
    console.log(`SYNC ${record.id}`);
  }

  console.log(`Synced ${records.length} Cloudinary artwork records to Supabase.`);
}

async function updateSupabaseArtworkImage(supabaseClient, record) {
  const { id, ...imageFields } = record;

  if (!id) {
    throw new Error("Cannot update Supabase artwork image without an id.");
  }

  const { error } = await supabaseClient.from("artworks").update(imageFields).eq("id", id);

  if (error) {
    throw new Error(`Failed to update ${id}: ${error.message}`);
  }
}

async function assertSupabaseArtworkImageSchema(supabaseClient) {
  const expectedColumns = [
    "source_image_url",
    "cloudinary_public_id",
    "cloudinary_url",
    "thumbnail_url",
    "blur_data_url",
    "width",
    "height",
    "aspect_ratio",
    "attribution",
    "license",
  ];
  const { error } = await supabaseClient
    .from("artworks")
    .select(["id", ...expectedColumns].join(","))
    .limit(1);

  if (!error) return;

  throw new Error(
    [
      `Supabase artworks table is missing Cloudinary image columns or the schema cache is stale: ${error.message}`,
      "Apply supabase/migrations/202605240001_add_cloudinary_artwork_images.sql to the target Supabase project, then reload the PostgREST schema cache.",
      "If the manifest already exists, rerun: npm run migrate:cloudinary -- --sync-supabase",
    ].join("\n"),
  );
}

function normalizeSupabaseUrl(value) {
  const url = new URL(value);

  return `${url.protocol}//${url.host}`;
}

function loadEnvFile(filePath) {
  const envPath = path.join(rootDir, filePath);
  if (!existsSync(envPath)) return;

  const envFile = readFileSync(envPath, "utf8");

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
