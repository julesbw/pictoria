# Supabase local/remote setup

1. Run `supabase/migrations/202605220001_initial_pictoria_schema.sql` in Supabase.
2. Enable anonymous sign-ins in Supabase Auth while Pictoria does not have a full login UI.
3. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`.
   Prefer the project root URL, for example `https://your-project.supabase.co`,
   not the REST URL ending in `/rest/v1`.
4. To seed catalog data, set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`, then run:

```bash
npm run seed:supabase
```

The app keeps `localStorage` as a fallback while the Supabase integration is being validated.
