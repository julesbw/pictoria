import { promises as fs } from "fs";
import path from "path";
import { artworks, getArtworkById } from "@/lib/artworks";
import type { Artwork } from "@/types";
import type { ArtworkImageCacheRecord } from "@/types/image-cache";

const cacheDbPath = path.join(process.cwd(), "data", "artwork-image-cache.json");
const cacheStorageDir = path.join(process.cwd(), "public", "artworks", "cache");
const thumbnailWidth = 960;

interface WikimediaImageInfo {
  sourceUrl?: string;
  thumbnailUrl: string;
  contentType?: string;
  licenseShortName?: string;
  licenseUrl?: string;
  attribution?: string;
  artistCredit?: string;
}

export async function resolveArtworkImage(artworkId: string) {
  const artwork = getArtworkById(artworkId);

  if (!artwork) {
    return null;
  }

  const cache = await readCacheDb();
  const cachedRecord = cache[artworkId];

  if (cachedRecord && (await fileExists(path.join(process.cwd(), "public", cachedRecord.local_cached_url)))) {
    return cachedRecord;
  }

  if (!artwork.wikimedia_file) {
    const localRecord = await createLocalRecord(artwork);
    cache[artworkId] = localRecord;
    await writeCacheDb(cache);
    return localRecord;
  }

  const imageInfo = await fetchWikimediaImageInfo(artwork.wikimedia_file);
  const extension = getImageExtension(imageInfo.contentType);
  const storagePath = path.join(cacheStorageDir, `${artwork.id}${extension}`);
  const localCachedUrl = `/artworks/cache/${artwork.id}${extension}`;

  await fs.mkdir(cacheStorageDir, { recursive: true });
  await downloadFile(imageInfo.thumbnailUrl, storagePath);

  const record: ArtworkImageCacheRecord = {
    artwork_id: artwork.id,
    local_cached_url: localCachedUrl,
    storage_path: `public${localCachedUrl}`,
    provider: "wikimedia",
    source_url: imageInfo.sourceUrl,
    thumbnail_url: imageInfo.thumbnailUrl,
    license_short_name: imageInfo.licenseShortName,
    license_url: imageInfo.licenseUrl,
    attribution: imageInfo.attribution,
    artist_credit: imageInfo.artistCredit,
    cached_at: new Date().toISOString(),
  };

  cache[artworkId] = record;
  await writeCacheDb(cache);
  return record;
}

async function createLocalRecord(artwork: Artwork): Promise<ArtworkImageCacheRecord> {
  return {
    artwork_id: artwork.id,
    local_cached_url: artwork.image_url,
    storage_path: `public${artwork.image_url}`,
    provider: "local",
    cached_at: new Date().toISOString(),
  };
}

async function fetchWikimediaImageInfo(fileTitle: string): Promise<WikimediaImageInfo> {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    titles: `File:${fileTitle}`,
    prop: "imageinfo",
    iiprop: "url|mime|extmetadata",
    iiurlwidth: String(thumbnailWidth),
  });

  const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, {
    headers: {
      "User-Agent": "PictoriaLocalMVP/0.1 (local educational prototype)",
    },
  });

  if (!response.ok) {
    throw new Error(`Wikimedia API request failed with ${response.status}.`);
  }

  const payload = await response.json();
  const pages = Object.values(payload.query?.pages ?? {}) as Array<{
    imageinfo?: Array<{
      url?: string;
      thumburl?: string;
      mime?: string;
      extmetadata?: Record<string, { value?: string }>;
    }>;
  }>;
  const info = pages[0]?.imageinfo?.[0];
  const metadata = info?.extmetadata ?? {};

  if (!info?.thumburl && !info?.url) {
    throw new Error(`Wikimedia image info missing URL for ${fileTitle}.`);
  }

  return {
    sourceUrl: info.url,
    thumbnailUrl: info.thumburl ?? info.url!,
    contentType: info.mime,
    licenseShortName: stripHtml(metadata.LicenseShortName?.value),
    licenseUrl: stripHtml(metadata.LicenseUrl?.value),
    attribution: stripHtml(metadata.Attribution?.value),
    artistCredit: stripHtml(metadata.Artist?.value ?? metadata.Credit?.value),
  };
}

async function downloadFile(url: string, destinationPath: string) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "PictoriaLocalMVP/0.1 (local educational prototype)",
    },
  });

  if (!response.ok) {
    throw new Error(`Image download failed with ${response.status}.`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  await fs.writeFile(destinationPath, buffer);
}

function getImageExtension(contentType?: string) {
  if (contentType === "image/png") return ".png";
  if (contentType === "image/webp") return ".webp";
  return ".jpg";
}

async function readCacheDb() {
  try {
    const file = await fs.readFile(cacheDbPath, "utf8");
    return JSON.parse(file) as Record<string, ArtworkImageCacheRecord>;
  } catch {
    return {};
  }
}

async function writeCacheDb(cache: Record<string, ArtworkImageCacheRecord>) {
  await fs.mkdir(path.dirname(cacheDbPath), { recursive: true });
  await fs.writeFile(cacheDbPath, `${JSON.stringify(cache, null, 2)}\n`);
}

async function fileExists(filePath: string) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function stripHtml(value?: string) {
  return value?.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

export function getArtworkImageSeedIds() {
  return artworks.map((artwork) => artwork.id);
}
