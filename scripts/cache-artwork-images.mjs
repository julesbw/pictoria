import { promises as fs } from "fs";
import path from "path";

const rootDir = process.cwd();
const artworksPath = path.join(rootDir, "data", "seed-artworks.json");
const cacheDbPath = path.join(rootDir, "data", "artwork-image-cache.json");
const cacheDir = path.join(rootDir, "public", "artworks", "cache");
const thumbnailWidth = 960;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const artworks = JSON.parse(await fs.readFile(artworksPath, "utf8"));
  const cache = await readCache();

  await fs.mkdir(cacheDir, { recursive: true });

  for (const artwork of artworks) {
    const cachedRecord = cache[artwork.id];

    if (cachedRecord && await fileExists(path.join(rootDir, "public", cachedRecord.local_cached_url))) {
      console.log(`HIT ${artwork.title}`);
      continue;
    }

    if (!artwork.wikimedia_file) {
      console.log(`SKIP ${artwork.title} missing wikimedia_file`);
      continue;
    }

    try {
      const imageInfo = await fetchWikimediaImageInfo(artwork.wikimedia_file);
      const extension = getImageExtension(imageInfo.contentType);
      const localCachedUrl = `/artworks/cache/${artwork.id}${extension}`;
      const storagePath = path.join(cacheDir, `${artwork.id}${extension}`);

      await downloadFile(imageInfo.thumbnailUrl, storagePath);

      cache[artwork.id] = {
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

      await writeCache(cache);
      console.log(`OK ${artwork.title}`);
      await sleep(1000);
    } catch (error) {
      console.log(`FAIL ${artwork.title}: ${error instanceof Error ? error.message : String(error)}`);
      await sleep(3000);
    }
  }
}

async function fetchWikimediaImageInfo(fileTitle) {
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
    throw new Error(`Wikimedia API request failed with ${response.status}`);
  }

  const payload = await response.json();
  const page = Object.values(payload.query?.pages ?? {})[0];
  const info = page?.imageinfo?.[0];
  const metadata = info?.extmetadata ?? {};

  if (!info?.thumburl && !info?.url) {
    throw new Error(`No image URL for ${fileTitle}`);
  }

  return {
    sourceUrl: info.url,
    thumbnailUrl: info.thumburl ?? info.url,
    contentType: info.mime,
    licenseShortName: stripHtml(metadata.LicenseShortName?.value),
    licenseUrl: stripHtml(metadata.LicenseUrl?.value),
    attribution: stripHtml(metadata.Attribution?.value),
    artistCredit: stripHtml(metadata.Artist?.value ?? metadata.Credit?.value),
  };
}

async function downloadFile(url, destinationPath) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "PictoriaLocalMVP/0.1 (local educational prototype)",
    },
  });

  if (!response.ok) {
    throw new Error(`Image download failed with ${response.status}`);
  }

  await fs.writeFile(destinationPath, Buffer.from(await response.arrayBuffer()));
}

async function readCache() {
  try {
    return JSON.parse(await fs.readFile(cacheDbPath, "utf8"));
  } catch {
    return {};
  }
}

async function writeCache(cache) {
  await fs.writeFile(cacheDbPath, `${JSON.stringify(cache, null, 2)}\n`);
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function stripHtml(value) {
  return value?.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function getImageExtension(contentType) {
  if (contentType === "image/png") return ".png";
  if (contentType === "image/webp") return ".webp";
  return ".jpg";
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
