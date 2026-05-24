alter table artworks
  add column if not exists museum text,
  add column if not exists source_image_url text,
  add column if not exists cloudinary_public_id text,
  add column if not exists cloudinary_url text,
  add column if not exists thumbnail_url text,
  add column if not exists blur_data_url text,
  add column if not exists width integer,
  add column if not exists height integer,
  add column if not exists aspect_ratio numeric,
  add column if not exists attribution text,
  add column if not exists license text;

create index if not exists artworks_cloudinary_public_id_idx
  on artworks (cloudinary_public_id)
  where cloudinary_public_id is not null;

notify pgrst, 'reload schema';
