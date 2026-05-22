import type { Metadata } from "next";
import { LanguageProvider } from "@/components/language/LanguageProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pictoria",
  description: "Juego educativo para aprender sobre pinturas famosas.",
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
