import type { Metadata } from "next";
import { LanguageProvider } from "@/components/language/LanguageProvider";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Pictoria",
  description: "Juego educativo para aprender sobre pinturas famosas.",
  icons: {
    icon: [
      { url: "/brand/pictoria-icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/brand/pictoria-icon.png", sizes: "650x650", type: "image/png" },
    ],
    apple: [
      {
        url: "/brand/pictoria-apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  openGraph: {
    title: "Pictoria",
    description: "Juego educativo para aprender sobre pinturas famosas.",
    images: [
      {
        url: "/brand/pictoria-brand-board.png",
        width: 1254,
        height: 1254,
        alt: "Pictoria",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
