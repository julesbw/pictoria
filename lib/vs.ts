"use client";

import { artworks, getArtworkById, getRandomArtworksFrom } from "@/lib/artworks";
import { generateQuizQuestion } from "@/lib/quiz";
import { ensureAnonymousSession } from "@/lib/supabase/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { QuestionType, QuizQuestion } from "@/types";
import type { Database } from "@/types/supabase";

export const DEFAULT_VS_TOTAL_ROUNDS = 5;
export const VS_BASE_POINTS = 100;
export const VS_MAX_SPEED_BONUS = 50;
export const VS_MAX_BONUS_WINDOW_MS = 10_000;
const roomCodeLength = 6;
const roomCodeAlphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

type VsRoomRow = Database["public"]["Tables"]["vs_rooms"]["Row"];
type VsPlayerRow = Database["public"]["Tables"]["vs_room_players"]["Row"];
type VsRoundRow = Database["public"]["Tables"]["vs_rounds"]["Row"];
type VsAnswerRow = Database["public"]["Tables"]["vs_answers"]["Row"];

export type VsRoomStatus = "waiting" | "active" | "completed" | "cancelled";

export interface VsQuestionPayload {
  artworkId: string;
  questionType: QuestionType;
  options: string[];
  correctAnswer: string;
}

export interface VsPlayer {
  id: string;
  roomId: string;
  userId: string;
  displayName: string | null;
  score: number;
  joinedAt: string;
}

export interface VsRound {
  id: string;
  roomId: string;
  roundNumber: number;
  question: VsQuestionPayload;
  createdAt: string;
}

export interface VsAnswer {
  id: string;
  roomId: string;
  roundId: string;
  userId: string;
  selectedOption: string;
  isCorrect: boolean;
  responseTimeMs: number | null;
  pointsEarned: number;
  answeredAt: string;
}

export interface VsPointBreakdown {
  total: number;
  base: number;
  speedBonus: number;
}

export interface VsRoomState {
  room: {
    id: string;
    roomCode: string;
    status: VsRoomStatus;
    createdBy: string | null;
    winnerUserId: string | null;
    currentRound: number;
    totalRounds: number;
    createdAt: string | null;
    startedAt: string | null;
    finishedAt: string | null;
  };
  players: VsPlayer[];
  rounds: VsRound[];
  answers: VsAnswer[];
  currentUserId: string;
}

export function getCurrentVsRound(state: VsRoomState) {
  return state.rounds.find((round) => round.roundNumber === state.room.currentRound) ?? null;
}

export function getCurrentUserVsAnswer(state: VsRoomState) {
  const currentRound = getCurrentVsRound(state);
  if (!currentRound) return null;

  return state.answers.find(
    (answer) => answer.roundId === currentRound.id && answer.userId === state.currentUserId,
  ) ?? null;
}

export function didAllVsPlayersAnswerCurrentRound(state: VsRoomState) {
  const currentRound = getCurrentVsRound(state);
  if (!currentRound || state.players.length < 2) return false;

  const answeredUserIds = new Set(
    state.answers
      .filter((answer) => answer.roundId === currentRound.id)
      .map((answer) => answer.userId),
  );

  return state.players.every((player) => answeredUserIds.has(player.userId));
}

export function calculateVsPoints(isCorrect: boolean, responseTimeMs: number) {
  if (!isCorrect) return 0;

  const clampedTime = Math.min(Math.max(responseTimeMs, 0), VS_MAX_BONUS_WINDOW_MS);
  const bonus = Math.round(
    VS_MAX_SPEED_BONUS * (1 - clampedTime / VS_MAX_BONUS_WINDOW_MS),
  );

  return VS_BASE_POINTS + bonus;
}

export function getVsPointBreakdown(answer: VsAnswer): VsPointBreakdown {
  if (!answer.isCorrect) {
    return {
      total: 0,
      base: 0,
      speedBonus: 0,
    };
  }

  return {
    total: answer.pointsEarned,
    base: VS_BASE_POINTS,
    speedBonus: Math.max(answer.pointsEarned - VS_BASE_POINTS, 0),
  };
}

export function sanitizeVsDisplayName(displayName: string) {
  return displayName.trim().replace(/\s+/g, " ").slice(0, 40);
}

export function getVsPlayerName(player: VsPlayer | undefined, index: number, language: "es" | "en" = "es") {
  if (player?.displayName) return player.displayName;

  return language === "es" ? `Jugador ${index + 1}` : `Player ${index + 1}`;
}

export function getVsOpponentName(state: VsRoomState, language: "es" | "en" = "es") {
  const opponentIndex = state.players.findIndex((player) => player.userId !== state.currentUserId);
  const opponent = opponentIndex >= 0 ? state.players[opponentIndex] : undefined;

  return getVsPlayerName(opponent, opponentIndex >= 0 ? opponentIndex : 1, language);
}

export async function createVsRoom(displayName: string) {
  const supabase = requireSupabaseClient();
  const user = await ensureAnonymousSession();
  const normalizedDisplayName = sanitizeVsDisplayName(displayName);

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const roomCode = generateRoomCode();
    const { data: room, error } = await supabase
      .from("vs_rooms")
      .insert({
        room_code: roomCode,
        created_by: user.id,
        total_rounds: DEFAULT_VS_TOTAL_ROUNDS,
      })
      .select("*")
      .single();

    if (error) {
      if (error.code === "23505") continue;
      throwVsSupabaseError("create room", error);
    }

    await insertCurrentPlayer(room.id, user.id, normalizedDisplayName);
    return getVsRoomStateById(room.id);
  }

  throw new Error("No se pudo generar un código de sala único.");
}

export async function joinVsRoom(roomCode: string, displayName: string) {
  const supabase = requireSupabaseClient();
  await ensureAnonymousSession();

  const normalizedCode = normalizeRoomCode(roomCode);
  const normalizedDisplayName = sanitizeVsDisplayName(displayName);
  const { data: roomId, error } = await supabase.rpc("join_vs_room", {
    p_room_code: normalizedCode,
    p_display_name: normalizedDisplayName,
  });

  if (error || !roomId) {
    throwVsSupabaseError("join room", error, "No se pudo unir a la sala.");
  }

  return getVsRoomStateById(roomId);
}

export async function getVsRoomStateByCode(roomCode: string) {
  const supabase = requireSupabaseClient();
  const currentUserId = (await ensureAnonymousSession()).id;
  const normalizedCode = normalizeRoomCode(roomCode);

  const { data: room, error } = await supabase
    .from("vs_rooms")
    .select("*")
    .eq("room_code", normalizedCode)
    .single();

  if (error || !room) {
    throwVsSupabaseError("load room by code", error, "No se pudo cargar la sala.");
  }

  return getVsRoomState(room, currentUserId);
}

export async function getVsRoomStateById(roomId: string) {
  const supabase = requireSupabaseClient();
  const currentUserId = (await ensureAnonymousSession()).id;

  const { data: room, error } = await supabase
    .from("vs_rooms")
    .select("*")
    .eq("id", roomId)
    .single();

  if (error || !room) {
    throwVsSupabaseError("load room by id", error, "No se pudo cargar la sala.");
  }

  return getVsRoomState(room, currentUserId);
}

export async function startVsRoom(roomId: string) {
  const supabase = requireSupabaseClient();
  await ensureAnonymousSession();
  const state = await getVsRoomStateById(roomId);

  if (state.room.createdBy !== state.currentUserId) {
    throw new Error("Solo el creador puede iniciar la partida.");
  }

  if (state.players.length < 2) {
    throw new Error("Se necesitan 2 jugadores para iniciar.");
  }

  if (state.rounds.length === 0) {
    const rounds = buildVsRoundInserts(roomId, state.room.totalRounds);
    const { error: roundsError } = await supabase.from("vs_rounds").upsert(rounds, {
      onConflict: "room_id,round_number",
      ignoreDuplicates: true,
    });

    if (roundsError) {
      throwVsSupabaseError("create rounds", roundsError);
    }
  }

  if (state.room.status === "waiting") {
    const { error } = await supabase
      .from("vs_rooms")
      .update({
        status: "active",
        current_round: 1,
        started_at: new Date().toISOString(),
      })
      .eq("id", roomId)
      .eq("status", "waiting");

    if (error) {
      throwVsSupabaseError("start room", error);
    }
  }

  return getVsRoomStateById(roomId);
}

export async function submitVsAnswer(params: {
  state: VsRoomState;
  selectedOption: string;
  responseTimeMs?: number | null;
}) {
  const supabase = requireSupabaseClient();
  await ensureAnonymousSession();
  const currentRound = getCurrentVsRound(params.state);

  if (!currentRound) {
    throw new Error("La ronda actual no está disponible.");
  }

  const isCorrect = params.selectedOption === currentRound.question.correctAnswer;
  const responseTimeMs = params.responseTimeMs ?? VS_MAX_BONUS_WINDOW_MS;
  const pointsEarned = calculateVsPoints(isCorrect, responseTimeMs);
  const { error } = await supabase.rpc("submit_vs_answer", {
    p_room_id: params.state.room.id,
    p_round_id: currentRound.id,
    p_selected_option: params.selectedOption,
    p_is_correct: isCorrect,
    p_response_time_ms: responseTimeMs,
    p_points_earned: pointsEarned,
  });

  if (error) {
    throwVsSupabaseError("submit answer", error);
  }

  return getVsRoomStateById(params.state.room.id);
}

export async function advanceVsRoomIfReady(roomId: string) {
  const supabase = requireSupabaseClient();
  await ensureAnonymousSession();
  const { error } = await supabase.rpc("advance_vs_room", {
    p_room_id: roomId,
  });

  if (error) {
    throwVsSupabaseError("advance room", error);
  }
}

export function buildQuizQuestionFromVsRound(round: VsRound): QuizQuestion | null {
  const artwork = getArtworkById(round.question.artworkId);
  if (!artwork) return null;

  const question = generateQuizQuestion(artwork, artworks, round.question.questionType);

  return {
    ...question,
    options: round.question.options,
    correct_answer: round.question.correctAnswer,
  };
}

export function normalizeRoomCode(roomCode: string) {
  return roomCode.trim().toUpperCase();
}

async function getVsRoomState(room: VsRoomRow, currentUserId: string): Promise<VsRoomState> {
  const supabase = requireSupabaseClient();
  const [playersResult, roundsResult, answersResult] = await Promise.all([
    supabase
      .from("vs_room_players")
      .select("*")
      .eq("room_id", room.id)
      .order("joined_at", { ascending: true }),
    supabase
      .from("vs_rounds")
      .select("*")
      .eq("room_id", room.id)
      .order("round_number", { ascending: true }),
    supabase
      .from("vs_answers")
      .select("*")
      .eq("room_id", room.id)
      .order("answered_at", { ascending: true }),
  ]);

  if (playersResult.error) throwVsSupabaseError("load players", playersResult.error);
  if (roundsResult.error) throwVsSupabaseError("load rounds", roundsResult.error);
  if (answersResult.error) throwVsSupabaseError("load answers", answersResult.error);

  return {
    room: mapRoom(rowOrThrow(room)),
    players: (playersResult.data ?? []).map(mapPlayer),
    rounds: (roundsResult.data ?? []).map(mapRound).filter((round): round is VsRound => Boolean(round)),
    answers: (answersResult.data ?? []).map(mapAnswer),
    currentUserId,
  };
}

async function insertCurrentPlayer(roomId: string, userId: string, displayName: string) {
  const supabase = requireSupabaseClient();
  const { error } = await supabase.from("vs_room_players").insert({
    room_id: roomId,
    user_id: userId,
    display_name: displayName,
  });

  if (error && error.code !== "23505") {
    throwVsSupabaseError("insert room player", error);
  }
}

function buildVsRoundInserts(roomId: string, totalRounds: number) {
  return getRandomArtworksFrom(artworks, totalRounds).map((artwork, index) => {
    const question = generateQuizQuestion(artwork, artworks);
    const payload: VsQuestionPayload = {
      artworkId: artwork.id,
      questionType: question.question_type,
      options: question.options,
      correctAnswer: question.correct_answer,
    };

    return {
      room_id: roomId,
      round_number: index + 1,
      question_id: JSON.stringify(payload),
    };
  });
}

function generateRoomCode() {
  const values = new Uint32Array(roomCodeLength);
  crypto.getRandomValues(values);

  return Array.from(values, (value) => roomCodeAlphabet[value % roomCodeAlphabet.length]).join("");
}

function mapRoom(row: VsRoomRow): VsRoomState["room"] {
  return {
    id: row.id,
    roomCode: row.room_code,
    status: row.status as VsRoomStatus,
    createdBy: row.created_by,
    winnerUserId: row.winner_user_id,
    currentRound: row.current_round ?? 1,
    totalRounds: row.total_rounds ?? DEFAULT_VS_TOTAL_ROUNDS,
    createdAt: row.created_at,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
  };
}

function mapPlayer(row: VsPlayerRow): VsPlayer {
  return {
    id: row.id,
    roomId: row.room_id ?? "",
    userId: row.user_id ?? "",
    displayName: row.display_name,
    score: row.score ?? 0,
    joinedAt: row.joined_at ?? "",
  };
}

function mapRound(row: VsRoundRow): VsRound | null {
  const question = parseQuestionPayload(row.question_id);
  if (!question) return null;

  return {
    id: row.id,
    roomId: row.room_id ?? "",
    roundNumber: row.round_number,
    question,
    createdAt: row.created_at ?? "",
  };
}

function mapAnswer(row: VsAnswerRow): VsAnswer {
  return {
    id: row.id,
    roomId: row.room_id ?? "",
    roundId: row.round_id ?? "",
    userId: row.user_id ?? "",
    selectedOption: row.selected_option,
    isCorrect: row.is_correct,
    responseTimeMs: row.response_time_ms,
    pointsEarned: row.points_earned ?? 0,
    answeredAt: row.answered_at ?? "",
  };
}

function parseQuestionPayload(value: string): VsQuestionPayload | null {
  try {
    const parsed = JSON.parse(value) as VsQuestionPayload;

    if (
      typeof parsed.artworkId !== "string" ||
      (parsed.questionType !== "guess_artist" &&
        parsed.questionType !== "guess_artwork" &&
        parsed.questionType !== "guess_movement") ||
      !Array.isArray(parsed.options) ||
      parsed.options.length !== 4 ||
      typeof parsed.correctAnswer !== "string" ||
      !parsed.options.includes(parsed.correctAnswer)
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function requireSupabaseClient() {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    throw new Error("Supabase no está configurado.");
  }

  return supabase;
}

function rowOrThrow(row: VsRoomRow) {
  return row;
}

function throwVsSupabaseError(
  operation: string,
  error: unknown,
  fallbackMessage = "No se pudo completar la acción VS.",
): never {
  console.error(`[VS] Supabase error during ${operation}`, error);

  if (isSupabaseError(error)) {
    if (error.message.includes("row-level security")) {
      throw new Error(
        "No se pudo autorizar esta acción. Recarga la página e intenta de nuevo.",
      );
    }

    if (error.message.includes("Authentication required")) {
      throw new Error("No se pudo iniciar sesión anónima. Recarga e intenta de nuevo.");
    }

    throw new Error(error.message);
  }

  throw new Error(fallbackMessage);
}

function isSupabaseError(error: unknown): error is { message: string } {
  return Boolean(error && typeof error === "object" && "message" in error);
}
