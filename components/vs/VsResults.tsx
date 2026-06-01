"use client";

import { useLanguage } from "@/components/language/LanguageProvider";
import { getVsPlayerName, type VsRoomState } from "@/lib/vs";

interface VsResultsProps {
  state: VsRoomState;
  onPlayAgain: () => void;
}

export function VsResults({ state, onPlayAgain }: VsResultsProps) {
  const { language } = useLanguage();
  const sortedPlayers = [...state.players].sort((first, second) => second.score - first.score);
  const topScore = sortedPlayers[0]?.score ?? 0;
  const tied = sortedPlayers.filter((player) => player.score === topScore).length > 1;
  const winnerIndex = state.players.findIndex((player) => player.userId === state.room.winnerUserId);
  const winner = winnerIndex >= 0 ? state.players[winnerIndex] : sortedPlayers[0];
  const winnerName = getVsPlayerName(winner, winnerIndex >= 0 ? winnerIndex : 0, language);
  const tiedNames = sortedPlayers
    .filter((player) => player.score === topScore)
    .map((player) => getVsPlayerName(player, state.players.indexOf(player), language));
  const resultTitle = tied
    ? language === "es"
      ? `Empate entre ${tiedNames.join(" y ")}`
      : `Draw between ${tiedNames.join(" and ")}`
    : language === "es"
      ? `Ganó ${winnerName}`
      : `${winnerName} won`;

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-stone-950/10 bg-white/75 p-6 text-center shadow-sm">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-stone-600">
          {language === "es" ? "Resultado final" : "Final result"}
        </p>
        <h1 className="mt-2 font-serif text-4xl font-semibold text-stone-950">
          {resultTitle}
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
                {getVsPlayerName(player, state.players.indexOf(player), language)}
                {player.userId === state.currentUserId ? (
                  <span className="pl-2 text-xs font-bold uppercase tracking-[0.12em] text-stone-500">
                    {language === "es" ? "Tú" : "You"}
                  </span>
                ) : null}
              </p>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-500">
                #{index + 1}
              </p>
            </div>
            <p className="text-2xl font-black tabular-nums text-stone-950">
              {player.score} <span className="text-sm font-bold text-stone-500">pts</span>
            </p>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onPlayAgain}
        className="rounded-full bg-stone-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-stone-800"
      >
        {language === "es" ? "Volver al modo VS" : "Back to VS mode"}
      </button>
    </section>
  );
}
