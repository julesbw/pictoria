"use client";

import { useLanguage } from "@/components/language/LanguageProvider";
import { getVsPlayerName, type VsRoomState } from "@/lib/vs";

interface VsWaitingRoomProps {
  state: VsRoomState;
  loading: boolean;
  error: string | null;
  onStart: () => void;
  onLeave: () => void;
}

export function VsWaitingRoom({
  state,
  loading,
  error,
  onStart,
  onLeave,
}: VsWaitingRoomProps) {
  const { language } = useLanguage();
  const isCreator = state.room.createdBy === state.currentUserId;
  const canStart = isCreator && state.players.length === 2;

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-stone-950/10 bg-white/75 p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-stone-600">
              {language === "es" ? "Sala VS" : "VS room"}
            </p>
            <h1 className="mt-2 font-serif text-4xl font-semibold text-stone-950">
              {state.room.roomCode}
            </h1>
            <p className="mt-2 text-sm text-stone-700">
              {language === "es"
                ? "Comparte este código con tu rival."
                : "Share this code with your opponent."}
            </p>
          </div>
          <button
            type="button"
            onClick={onLeave}
            className="rounded-full border border-stone-950/10 bg-white px-4 py-2 text-sm font-bold text-stone-700 transition hover:bg-stone-50"
          >
            {language === "es" ? "Salir" : "Leave"}
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-2xl border border-stone-950/10 bg-white/75 p-5 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-stone-600">
            {language === "es" ? "Jugadores" : "Players"}
          </p>
          <div className="mt-4 grid gap-3">
            {[0, 1].map((slot) => {
              const player = state.players[slot];
              const playerName = getVsPlayerName(player, slot, language);
              return (
                <div
                  key={player?.id ?? slot}
                  className="rounded-xl border border-stone-950/10 bg-white px-4 py-3 text-sm font-semibold text-stone-800"
                >
                  {player ? (
                    <span>
                      {playerName}
                      {player.userId === state.currentUserId ? (
                        <span className="pl-2 text-xs font-bold uppercase tracking-[0.12em] text-stone-500">
                          {language === "es" ? "Tú" : "You"}
                        </span>
                      ) : null}
                    </span>
                  ) : language === "es" ? "Esperando jugador..." : "Waiting for player..."}
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-stone-950/10 bg-white/75 p-5 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-stone-600">
            {language === "es" ? "Inicio" : "Start"}
          </p>
          <p className="mt-4 text-sm leading-6 text-stone-700">
            {isCreator
              ? language === "es"
                ? `Cuando haya 2 jugadores, podrás iniciar las ${state.room.totalRounds} rondas.`
                : `Once 2 players are in, you can start the ${state.room.totalRounds} rounds.`
              : language === "es"
                ? "Espera a que el creador inicie la partida."
                : "Wait for the creator to start the match."}
          </p>
          {isCreator ? (
            <button
              type="button"
              onClick={onStart}
              disabled={!canStart || loading}
              className="mt-5 rounded-full bg-stone-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? language === "es" ? "Iniciando..." : "Starting..."
                : language === "es" ? "Iniciar duelo" : "Start duel"}
            </button>
          ) : null}
          {error ? (
            <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
