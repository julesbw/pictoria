import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { ThemeWrapper } from "@/components/themes/ThemeWrapper";
import { cn } from "@/lib/utils";
import type { MovementThemeKey } from "@/types";

interface AppShellProps {
  children: React.ReactNode;
  themeKey?: MovementThemeKey;
  className?: string;
}

export function AppShell({ children, themeKey, className }: AppShellProps) {
  return (
    <ThemeWrapper themeKey={themeKey} className={cn("flex flex-col", className)}>
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:py-12">
        {children}
      </main>
      <Footer />
    </ThemeWrapper>
  );
}
