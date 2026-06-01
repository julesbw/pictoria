"use client";

import { useState } from "react";
import { useLanguage } from "@/components/language/LanguageProvider";

interface VsLobbyProps {
  loading: boolean;
  authReady: boolean;
  error: string | null;
  onCreate: () => void;
  onJoin: (roomCode: string) => void;
}

export function VsLobby({ loading, authReady, error, onCreate, onJoin }: VsLobbyProps) {
  const { language } = useLanguage();
  const [roomCode, setRoomCode] = useState("");
  const disabled = loading || !authReady;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onJoin(roomCode);
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[1fr_1fr]">
      <div className="rounded-2xl border border-stone-950/10 bg-white/75 p-5 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-stone-600">
          {language === "es" ? "Modo VS" : "VS mode"}
        </p>
        <h1 className="mt-2 font-serif text-4xl font-semibold text-stone-950">
          {language === "es" ? "Duelo de arte" : "Art duel"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-stone-700">
          {language === "es"
            ? "Crea una sala para dos jugadores y compitan durante 5 rondas con las mismas preguntas."
            : "Create a two-player room and compete across 5 shared rounds."}
        </p>
        {!authReady ? (
          <p className="mt-4 text-sm font-semibold text-stone-500">
            {language === "es" ? "Preparando sesión..." : "Preparing session..."}
          </p>
        ) : null}
        <button
          type="button"
          onClick={onCreate}
          disabled={disabled}
          className="mt-5 rounded-full bg-stone-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? language === "es" ? "Creando..." : "Creating..."
            : language === "es" ? "Crear partida" : "Create match"}
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-stone-950/10 bg-white/75 p-5 shadow-sm"
      >
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-stone-600">
          {language === "es" ? "Unirse" : "Join"}
        </p>
        <label htmlFor="vs-room-code" className="mt-4 block text-sm font-semibold text-stone-900">
          {language === "es" ? "Código de sala" : "Room code"}
        </label>
        <input
          id="vs-room-code"
          value={roomCode}
          onChange={(event) => setRoomCode(event.target.value.toUpperCase())}
          maxLength={6}
          placeholder="ABC123"
          className="mt-2 w-full rounded-xl border border-stone-950/15 bg-white px-4 py-3 text-lg font-bold uppercase tracking-[0.16em] text-stone-950 outline-none transition focus:border-stone-950/40 focus:ring-4 focus:ring-stone-950/5"
        />
        <button
          type="submit"
          disabled={disabled || roomCode.trim().length === 0}
          className="mt-4 rounded-full bg-stone-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? language === "es" ? "Entrando..." : "Joining..."
            : language === "es" ? "Entrar con código" : "Join with code"}
        </button>
        {error ? (
          <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {error}
          </p>
        ) : null}
      </form>
    </section>
  );
}
