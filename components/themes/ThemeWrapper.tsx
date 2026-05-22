"use client";

import { motion } from "framer-motion";
import { getArtTheme } from "@/lib/themes";
import { cn } from "@/lib/utils";
import type { MovementThemeKey } from "@/types";

interface ThemeWrapperProps {
  themeKey?: MovementThemeKey;
  children: React.ReactNode;
  className?: string;
}

export function ThemeWrapper({ themeKey, children, className }: ThemeWrapperProps) {
  const theme = getArtTheme(themeKey);

  return (
    <motion.div
      className={cn("min-h-screen transition-colors duration-500", theme.background, className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      {children}
    </motion.div>
  );
}
