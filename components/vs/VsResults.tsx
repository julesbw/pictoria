"use client";

import { useLanguage } from "@/components/language/LanguageProvider";
import type { VsRoomState } from "@/lib/vs";

interface VsResultsProps {
  state: VsRoomState;
  onPlayAgain: () => void;
}

export function VsResults({ state, onPlayAgain }: VsResultsProps) {
  const { language } = useLanguage();
  const sortedPlayers = [...state.players].sort((first, second) => second.score - first.score);
  const topScore = sortedPlayers[0]?.score ?? 0;
  const tied = sortedPlayers.filter((player) => player.score === topScore).length > 1;
  const didCurrentUserWin = state.room.winnerUserId === state.currentUserId && !tied;

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-stone-950/10 bg-white/75 p-6 text-center shadow-sm">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-stone-600">
          {language === "es" ? "Resultado final" : "Final result"}
        </p>
        <h1 className="mt-2 font-serif text-4xl font-semibold text-stone-950">
          {tied
            ? language === "es" ? "Empate" : "Draw"
            : didCurrentUserWin
              ? language === "es" ? "Ganaste" : "You won"
              : language === "es" ? "Ganó tu rival" : "Your opponent won"}
        </h1>
      </div>

      <div className="grid gap-3">
        {sortedPlayers.map((player, index) => (
          <div
            key={player.id}
            className="flex items-center justify-between rounded-2xl border border-stone-950/10 bg-white/75 px-5 py-4 shadow-sm"
          >
            <div>
              <p className="text-sm font-bold text-stone-950">
                {player.userId === state.currentUserId
                  ? language === "es" ? "Tú" : "You"
                  : language === "es" ? "Rival" : "Opponent"}
              </p>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-500">
                #{index + 1}
              </p>
            </div>
            <p className="text-2xl font-black tabular-nums text-stone-950">{player.score}</p>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onPlayAgain}
        className="rounded-full bg-stone-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-stone-800"
      >
        {language === "es" ? "Crear otra partida" : "Create another match"}
      </button>
    </section>
  );
}
