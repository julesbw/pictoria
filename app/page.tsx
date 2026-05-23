import { AppShell } from "@/components/layout/AppShell";
import { HomeContent } from "@/components/home/HomeContent";
import { getRandomArtworksHybrid } from "@/lib/artworks";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const featuredArtworks = await getRandomArtworksHybrid(7);

  return (
    <AppShell themeKey="impressionism">
      <HomeContent featuredArtworks={featuredArtworks} />
    </AppShell>
  );
}
