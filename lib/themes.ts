import type { MovementThemeKey } from "@/types";

export const artThemes = {
  impressionism: {
    name: "Impresionismo",
    background: "bg-gradient-to-br from-pink-100 via-sky-100 to-yellow-50",
    card: "bg-white/70 backdrop-blur-md rounded-2xl shadow-artwork border border-white/70",
    accent: "text-rose-600",
    button: "bg-pink-300 hover:bg-pink-400 text-stone-950",
    muted: "text-stone-700",
    surface: "bg-white/55",
  },
  post_impressionism: {
    name: "Postimpresionismo",
    background: "bg-gradient-to-br from-blue-950 via-indigo-800 to-yellow-300",
    card: "bg-blue-950/75 border border-yellow-300/70 rounded-2xl shadow-artwork text-white",
    accent: "text-yellow-300",
    button: "bg-yellow-300 hover:bg-yellow-400 text-blue-950",
    muted: "text-blue-100",
    surface: "bg-white/10",
  },
  surrealism: {
    name: "Surrealismo",
    background: "bg-gradient-to-br from-fuchsia-100 via-orange-100 to-sky-200",
    card: "bg-white/65 backdrop-blur-md rounded-2xl shadow-artwork border border-white/60",
    accent: "text-purple-700",
    button: "bg-purple-500 hover:bg-purple-600 text-white",
    muted: "text-stone-700",
    surface: "bg-white/45",
  },
  cubism: {
    name: "Cubismo",
    background: "bg-gradient-to-br from-stone-200 via-orange-200 to-slate-300",
    card: "bg-white border-4 border-black rounded-none shadow-[8px_8px_0px_#000]",
    accent: "text-orange-700",
    button: "bg-black text-white hover:bg-stone-800",
    muted: "text-stone-700",
    surface: "bg-stone-100",
  },
  renaissance: {
    name: "Renacimiento",
    background: "bg-gradient-to-br from-amber-100 via-stone-100 to-yellow-200",
    card: "bg-white/85 border border-amber-700/50 rounded-2xl shadow-artwork",
    accent: "text-amber-800",
    button: "bg-amber-700 hover:bg-amber-800 text-white",
    muted: "text-stone-700",
    surface: "bg-amber-50/75",
  },
  baroque: {
    name: "Barroco",
    background: "bg-gradient-to-br from-stone-950 via-red-950 to-amber-900",
    card: "bg-black/55 border border-amber-500/70 rounded-2xl shadow-artwork text-white",
    accent: "text-amber-300",
    button: "bg-amber-500 hover:bg-amber-600 text-black",
    muted: "text-amber-100",
    surface: "bg-white/10",
  },
  modernism: {
    name: "Modernismo",
    background: "bg-gradient-to-br from-slate-100 via-white to-zinc-200",
    card: "bg-white rounded-2xl shadow-artwork border border-zinc-200",
    accent: "text-zinc-950",
    button: "bg-zinc-950 hover:bg-zinc-700 text-white",
    muted: "text-zinc-600",
    surface: "bg-zinc-100",
  },
} as const;

export type ArtTheme = (typeof artThemes)[MovementThemeKey];

export function getArtTheme(themeKey?: MovementThemeKey): ArtTheme {
  return artThemes[themeKey ?? "modernism"] ?? artThemes.modernism;
}
