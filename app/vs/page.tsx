"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { VsGameRound } from "@/components/vs/VsGameRound";
import { VsLobby } from "@/components/vs/VsLobby";
import { VsResults } from "@/components/vs/VsResults";
import { VsWaitingRoom } from "@/components/vs/VsWaitingRoom";
import {
  advanceVsRoomIfReady,
  createVsRoom,
  didAllVsPlayersAnswerCurrentRound,
  getCurrentVsRound,
  getVsRoomStateByCode,
  getVsRoomStateById,
  joinVsRoom,
  sanitizeVsDisplayName,
  startVsRoom,
  submitVsAnswer,
  type VsRoomState,
} from "@/lib/vs";
import { ensureAnonymousSession } from "@/lib/supabase/auth";

const storedRoomCodeKey = "pictoria:vs-room-code";
const storedPlayerNameKey = "pictoria_vs_player_name";

export default function VsPage() {
  const [roomState, setRoomState] = useState<VsRoomState | null>(null);
  const [loading, setLoading] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState("");
  const roundStartedAtRef = useRef(Date.now());
  const advancingRoomIdRef = useRef<string | null>(null);
  const currentRoundKey = roomState
    ? `${roomState.room.id}:${roomState.room.currentRound}`
    : "lobby";

  const refreshRoom = useCallback(async (roomId: string) => {
    if (!authReady) return;

    const nextState = await getVsRoomStateById(roomId);

    if (nextState.room.status === "active" && didAllVsPlayersAnswerCurrentRound(nextState)) {
      setRoomState(nextState);

      if (advancingRoomIdRef.current !== nextState.room.id) {
        advancingRoomIdRef.current = nextState.room.id;
        window.setTimeout(() => {
          void advanceVsRoomIfReady(nextState.room.id)
            .then(() => getVsRoomStateById(roomId))
            .then((advancedState) => {
              setRoomState(advancedState);
            })
            .catch((advanceError: Error) => {
              setError(advanceError.message);
            })
            .finally(() => {
              advancingRoomIdRef.current = null;
            });
        }, 900);
      }

      return;
    }

    setRoomState(nextState);
  }, [authReady]);

  useEffect(() => {
    const storedPlayerName = window.localStorage.getItem(storedPlayerNameKey);
    if (storedPlayerName) {
      setPlayerName(storedPlayerName);
    }

    let cancelled = false;

    async function prepareAuth() {
      try {
        await ensureAnonymousSession();
        if (!cancelled) {
          setAuthReady(true);
          setError(null);
        }
      } catch (authError) {
        console.error("[VS] Anonymous auth initialization failed", authError);
        if (!cancelled) {
          setError("No se pudo iniciar sesión anónima. Recarga e intenta de nuevo.");
        }
      }
    }

    void prepareAuth();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!authReady) return;

    const storedCode = window.localStorage.getItem(storedRoomCodeKey);
    if (!storedCode) return;

    const roomCode = storedCode;
    let cancelled = false;

    async function restoreRoom() {
      try {
        const restoredState = await getVsRoomStateByCode(roomCode);
        if (!cancelled) setRoomState(restoredState);
      } catch {
        window.localStorage.removeItem(storedRoomCodeKey);
      }
    }

    void restoreRoom();

    return () => {
      cancelled = true;
    };
  }, [authReady]);

  useEffect(() => {
    if (!roomState) return;

    const interval = window.setInterval(() => {
      void refreshRoom(roomState.room.id).catch((refreshError: Error) => {
        setError(refreshError.message);
      });
    }, 2000);

    return () => window.clearInterval(interval);
  }, [refreshRoom, roomState]);

  useEffect(() => {
    roundStartedAtRef.current = Date.now();
  }, [currentRoundKey]);

  async function handleCreateRoom() {
    if (!authReady) return;

    const displayName = getValidPlayerName();
    if (!displayName) return;

    setLoading(true);
    setError(null);

    try {
      window.localStorage.setItem(storedPlayerNameKey, displayName);
      const nextState = await createVsRoom(displayName);
      window.localStorage.setItem(storedRoomCodeKey, nextState.room.roomCode);
      setRoomState(nextState);
    } catch (createError) {
      setError(errorMessage(createError));
    } finally {
      setLoading(false);
    }
  }

  async function handleJoinRoom(roomCode: string) {
    if (!authReady) return;

    const displayName = getValidPlayerName();
    if (!displayName) return;

    setLoading(true);
    setError(null);

    try {
      window.localStorage.setItem(storedPlayerNameKey, displayName);
      const nextState = await joinVsRoom(roomCode, displayName);
      window.localStorage.setItem(storedRoomCodeKey, nextState.room.roomCode);
      setRoomState(nextState);
    } catch (joinError) {
      setError(errorMessage(joinError));
    } finally {
      setLoading(false);
    }
  }

  async function handleStartRoom() {
    if (!roomState || !authReady) return;

    setLoading(true);
    setError(null);

    try {
      setRoomState(await startVsRoom(roomState.room.id));
    } catch (startError) {
      setError(errorMessage(startError));
    } finally {
      setLoading(false);
    }
  }

  async function handleAnswer(selectedOption: string) {
    if (!roomState || !authReady) return;

    setLoading(true);
    setError(null);

    try {
      const responseTimeMs = Date.now() - roundStartedAtRef.current;
      setRoomState(await submitVsAnswer({ state: roomState, selectedOption, responseTimeMs }));
    } catch (answerError) {
      setError(errorMessage(answerError));
    } finally {
      setLoading(false);
    }
  }

  function handleLeaveRoom() {
    window.localStorage.removeItem(storedRoomCodeKey);
    setRoomState(null);
    setError(null);
  }

  function handlePlayerNameChange(nextPlayerName: string) {
    setPlayerName(nextPlayerName);
    const displayName = sanitizeVsDisplayName(nextPlayerName);

    if (displayName) {
      window.localStorage.setItem(storedPlayerNameKey, displayName);
    } else {
      window.localStorage.removeItem(storedPlayerNameKey);
    }
  }

  function getValidPlayerName() {
    const displayName = sanitizeVsDisplayName(playerName);

    if (!displayName) {
      setError("Escribe tu nombre para jugar el duelo.");
      return null;
    }

    return displayName;
  }

  const currentRound = roomState ? getCurrentVsRound(roomState) : null;

  return (
    <AppShell>
      {!roomState ? (
        <VsLobby
          loading={loading}
          authReady={authReady}
          playerName={playerName}
          nameRequired={authReady && sanitizeVsDisplayName(playerName).length === 0}
          error={error}
          onPlayerNameChange={handlePlayerNameChange}
          onCreate={handleCreateRoom}
          onJoin={handleJoinRoom}
        />
      ) : roomState.room.status === "waiting" ? (
        <VsWaitingRoom
          state={roomState}
          loading={loading}
          error={error}
          onStart={handleStartRoom}
          onLeave={handleLeaveRoom}
        />
      ) : roomState.room.status === "completed" ? (
        <VsResults state={roomState} onPlayAgain={handleLeaveRoom} />
      ) : currentRound ? (
        <VsGameRound
          state={roomState}
          round={currentRound}
          loading={loading}
          error={error}
          onAnswer={handleAnswer}
          onLeave={handleLeaveRoom}
        />
      ) : (
        <VsWaitingRoom
          state={roomState}
          loading={loading}
          error={error ?? "Preparando rondas..."}
          onStart={handleStartRoom}
          onLeave={handleLeaveRoom}
        />
      )}
    </AppShell>
  );
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Ocurrió un error inesperado.";
}
