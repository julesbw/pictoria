# Supabase local/remote setup

1. Run the migrations in `supabase/migrations` in order:

```txt
202605220001_initial_pictoria_schema.sql
202605240001_add_cloudinary_artwork_images.sql
```

2. Enable anonymous sign-ins in Supabase Auth while Pictoria does not have a full login UI.
3. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`.
   Prefer the project root URL, for example `https://your-project.supabase.co`,
   not the REST URL ending in `/rest/v1`.
4. To seed catalog data, set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`, then run:

```bash
npm run seed:supabase
```

5. To sync Cloudinary image fields after generating the migration manifest, run:

```bash
npm run sync:cloudinary
```

The app keeps `localStorage` as a fallback while the Supabase integration is being validated.
