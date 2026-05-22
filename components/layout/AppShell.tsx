import { Navbar } from "@/components/layout/Navbar";
import { ThemeWrapper } from "@/components/themes/ThemeWrapper";
import type { MovementThemeKey } from "@/types";

interface AppShellProps {
  children: React.ReactNode;
  themeKey?: MovementThemeKey;
  className?: string;
}

export function AppShell({ children, themeKey, className }: AppShellProps) {
  return (
    <ThemeWrapper themeKey={themeKey} className={className}>
      <Navbar />
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:py-12">{children}</main>
    </ThemeWrapper>
  );
}
