export interface ArtworkImageCacheRecord {
  artwork_id: string;
  local_cached_url: string;
  storage_path: string;
  provider: "local" | "wikimedia";
  source_url?: string;
  thumbnail_url?: string;
  license_short_name?: string;
  license_url?: string;
  attribution?: string;
  artist_credit?: string;
  cached_at: string;
}
