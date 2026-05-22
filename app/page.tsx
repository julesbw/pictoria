import { AppShell } from "@/components/layout/AppShell";
import { HomeContent } from "@/components/home/HomeContent";
import { getRandomArtworks } from "@/lib/artworks";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const featuredArtworks = getRandomArtworks(7);

  return (
    <AppShell themeKey="impressionism">
      <HomeContent featuredArtworks={featuredArtworks} />
    </AppShell>
  );
}
