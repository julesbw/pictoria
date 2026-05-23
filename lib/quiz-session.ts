import { artworks, getArtworkById } from "@/lib/artworks";
import { generateQuizQuestion } from "@/lib/quiz";
import { getSupabaseUserId } from "@/lib/supabase/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { QuizQuestion, QuestionType } from "@/types";
import type { Database } from "@/types/supabase";

const legacyStorageKey = "pictoria:quiz-session";

export type QuizMode = "classic" | "famous_10" | "interested_10" | "art_lover_10";

const quizSessionStorageKeys: Record<QuizMode, string> = {
  classic: "pictoria:quiz-session:classic",
  famous_10: "pictoria:quiz-session:famous-10",
  interested_10: "pictoria:quiz-session:interested-10",
  art_lover_10: "pictoria:quiz-session:art-lover-10",
};

export interface QuizScore {
  correct: number;
  total: number;
  unanswered: number;
}

export interface QuizSession {
  mode: QuizMode;
  round: number;
  score: QuizScore;
  question: QuizQuestion;
  selectedAnswer: string | null;
  questionStartedAt: number;
  timedOut?: boolean;
  artworkQueue?: string[];
  completed?: boolean;
}

interface StoredQuizSession {
  mode?: QuizMode;
  round: number;
  score: QuizScore;
  artworkId: string;
  questionType: QuestionType;
  options: string[];
  correctAnswer: string;
  selectedAnswer: string | null;
  questionStartedAt?: number;
  timedOut?: boolean;
  artworkQueue?: string[];
  completed?: boolean;
}

export function loadQuizSession(mode?: QuizMode) {
  if (typeof window === "undefined") return null;

  const keysToRead = mode
    ? [quizSessionStorageKeys[mode], legacyStorageKey]
    : [...Object.values(quizSessionStorageKeys), legacyStorageKey];

  for (const storageKey of keysToRead) {
    const session = loadQuizSessionFromKey(storageKey, mode);

    if (session) return session;
  }

  return null;
}

export async function loadQuizSessionHybrid(mode?: QuizMode) {
  const localSession = loadQuizSession(mode);
  const remoteSession = await loadQuizSessionFromSupabase(mode);

  if (remoteSession) {
    saveQuizSession(remoteSession);
    return remoteSession;
  }

  if (localSession) {
    await saveQuizSessionToSupabase(localSession);
  }

  return localSession;
}

export function saveQuizSession(session: QuizSession) {
  if (typeof window === "undefined") return;

  const storedSession: StoredQuizSession = {
    mode: session.mode,
    round: session.round,
    score: session.score,
    artworkId: session.question.artwork.id,
    questionType: session.question.question_type,
    options: session.question.options,
    correctAnswer: session.question.correct_answer,
    selectedAnswer: session.selectedAnswer,
    questionStartedAt: session.questionStartedAt,
    timedOut: session.timedOut,
    artworkQueue: session.artworkQueue,
    completed: session.completed,
  };

  window.localStorage.setItem(
    quizSessionStorageKeys[session.mode],
    JSON.stringify(storedSession),
  );
  window.localStorage.removeItem(legacyStorageKey);
}

export async function saveQuizSessionHybrid(session: QuizSession) {
  saveQuizSession(session);
  await saveQuizSessionToSupabase(session);
}

export function hasActiveQuizSession(mode?: QuizMode) {
  if (!mode) {
    return (Object.keys(quizSessionStorageKeys) as QuizMode[]).some((quizMode) => {
      const session = loadQuizSession(quizMode);
      return Boolean(session && isActiveQuizSession(session));
    });
  }

  const session = loadQuizSession(mode);
  return Boolean(session && isActiveQuizSession(session));
}

export async function hasActiveQuizSessionHybrid(mode?: QuizMode) {
  const session = await loadQuizSessionHybrid(mode);
  return Boolean(session && isActiveQuizSession(session));
}

export function hasResumableQuizSession(mode: QuizMode) {
  const session = loadQuizSession(mode);

  return Boolean(
    session &&
      isActiveQuizSession(session) &&
      (session.round > 0 || session.score.total > 0),
  );
}

export async function hasResumableQuizSessionHybrid(mode: QuizMode) {
  const session = await loadQuizSessionHybrid(mode);

  return Boolean(
    session &&
      isActiveQuizSession(session) &&
      (session.round > 0 || session.score.total > 0),
  );
}

export function clearQuizSession(mode?: QuizMode) {
  if (typeof window === "undefined") return;

  if (mode) {
    window.localStorage.removeItem(quizSessionStorageKeys[mode]);
    return;
  }

  Object.values(quizSessionStorageKeys).forEach((storageKey) => {
    window.localStorage.removeItem(storageKey);
  });
  window.localStorage.removeItem(legacyStorageKey);
}

export async function clearQuizSessionHybrid(mode?: QuizMode) {
  clearQuizSession(mode);
  await clearQuizSessionFromSupabase(mode);
}

export function isActiveQuizSession(session: QuizSession) {
  if (session.completed) return false;

  if (session.mode === "classic") {
    return (
      !session.timedOut &&
      (session.selectedAnswer === null ||
        session.selectedAnswer === session.question.correct_answer)
    );
  }

  return true;
}

function isValidStoredSession(session: StoredQuizSession) {
  return (
    Number.isInteger(session.round) &&
    session.round >= 0 &&
    Number.isInteger(session.score?.correct) &&
    Number.isInteger(session.score?.total) &&
    Number.isInteger(session.score?.unanswered ?? 0) &&
    session.score.correct >= 0 &&
    (session.score.unanswered ?? 0) >= 0 &&
    session.score.total >= session.score.correct &&
    session.score.total >= session.score.correct + (session.score.unanswered ?? 0) &&
    Array.isArray(session.options) &&
    session.options.length === 4 &&
    new Set(session.options).size === 4 &&
    session.options.includes(session.correctAnswer) &&
    (session.selectedAnswer === null || session.options.includes(session.selectedAnswer)) &&
    (session.mode === undefined ||
      session.mode === "classic" ||
      session.mode === "famous_10" ||
      session.mode === "interested_10" ||
      session.mode === "art_lover_10") &&
    (session.artworkQueue === undefined ||
      (Array.isArray(session.artworkQueue) &&
        session.artworkQueue.every((artworkId) => typeof artworkId === "string"))) &&
    (session.questionStartedAt === undefined ||
      (Number.isFinite(session.questionStartedAt) && session.questionStartedAt > 0)) &&
    (session.timedOut === undefined || typeof session.timedOut === "boolean") &&
    (session.completed === undefined || typeof session.completed === "boolean")
  );
}

function loadQuizSessionFromKey(storageKey: string, mode?: QuizMode) {
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return null;

    const parsed = JSON.parse(stored) as StoredQuizSession;
    const sessionMode = parsed.mode ?? "classic";
    const artwork = getArtworkById(parsed.artworkId);

    if (!artwork || !isValidStoredSession(parsed)) {
      window.localStorage.removeItem(storageKey);
      return null;
    }

    if (mode && sessionMode !== mode) {
      migrateLegacySession(storageKey, sessionMode, stored);
      return null;
    }

    const question = generateQuizQuestion(artwork, artworks, parsed.questionType);

    return {
      mode: sessionMode,
      round: parsed.round,
      score: {
        ...parsed.score,
        unanswered: parsed.score.unanswered ?? 0,
      },
      question: {
        ...question,
        options: parsed.options,
        correct_answer: parsed.correctAnswer,
      },
      selectedAnswer: parsed.selectedAnswer ?? null,
      questionStartedAt: parsed.questionStartedAt ?? Date.now(),
      timedOut: parsed.timedOut ?? false,
      artworkQueue: parsed.artworkQueue,
      completed: parsed.completed ?? false,
    };
  } catch {
    window.localStorage.removeItem(storageKey);
    return null;
  }
}

function migrateLegacySession(
  storageKey: string,
  sessionMode: QuizMode,
  storedSession: string,
) {
  if (storageKey !== legacyStorageKey) return;

  window.localStorage.setItem(quizSessionStorageKeys[sessionMode], storedSession);
  window.localStorage.removeItem(legacyStorageKey);
}

type QuizSessionRow = Database["public"]["Tables"]["quiz_sessions"]["Row"];
type QuizSessionUpsert = Database["public"]["Tables"]["quiz_sessions"]["Insert"];

async function loadQuizSessionFromSupabase(mode?: QuizMode) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  try {
    const userId = await getSupabaseUserId();
    if (!userId) return null;

    let query = supabase
      .from("quiz_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (mode) {
      query = query.eq("mode", mode);
    }

    const { data, error } = await query.limit(1);
    if (error || !data?.[0]) return null;

    return quizSessionFromRow(data[0]);
  } catch {
    return null;
  }
}

async function saveQuizSessionToSupabase(session: QuizSession) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;

  try {
    const userId = await getSupabaseUserId();
    if (!userId) return;

    const payload: QuizSessionUpsert = {
      user_id: userId,
      mode: session.mode,
      round: session.round,
      score_correct: session.score.correct,
      score_total: session.score.total,
      score_unanswered: session.score.unanswered,
      current_artwork_id: session.question.artwork.id,
      current_question_type: session.question.question_type,
      current_options: session.question.options,
      current_correct_answer: session.question.correct_answer,
      selected_answer: session.selectedAnswer,
      question_started_at: new Date(session.questionStartedAt).toISOString(),
      timed_out: session.timedOut ?? false,
      artwork_queue: session.artworkQueue ?? null,
      completed: session.completed ?? false,
    };

    await supabase.from("quiz_sessions").upsert(payload, {
      onConflict: "user_id,mode",
    });
  } catch {
    // Keep localStorage as the source of truth until Supabase is reachable.
  }
}

async function clearQuizSessionFromSupabase(mode?: QuizMode) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;

  try {
    const userId = await getSupabaseUserId();
    if (!userId) return;

    let query = supabase.from("quiz_sessions").delete().eq("user_id", userId);

    if (mode) {
      query = query.eq("mode", mode);
    }

    await query;
  } catch {
    // Local clear already happened; remote can catch up on the next save.
  }
}

function quizSessionFromRow(row: QuizSessionRow): QuizSession | null {
  const artwork = getArtworkById(row.current_artwork_id);

  if (!artwork) return null;

  const storedSession: StoredQuizSession = {
    mode: row.mode === "vs" ? "classic" : row.mode,
    round: row.round,
    score: {
      correct: row.score_correct,
      total: row.score_total,
      unanswered: row.score_unanswered,
    },
    artworkId: row.current_artwork_id,
    questionType: row.current_question_type,
    options: row.current_options,
    correctAnswer: row.current_correct_answer,
    selectedAnswer: row.selected_answer,
    questionStartedAt: new Date(row.question_started_at).getTime(),
    timedOut: row.timed_out,
    artworkQueue: row.artwork_queue ?? undefined,
    completed: row.completed,
  };

  if (!isValidStoredSession(storedSession)) return null;

  const question = generateQuizQuestion(artwork, artworks, storedSession.questionType);

  return {
    mode: storedSession.mode ?? "classic",
    round: storedSession.round,
    score: storedSession.score,
    question: {
      ...question,
      options: storedSession.options,
      correct_answer: storedSession.correctAnswer,
    },
    selectedAnswer: storedSession.selectedAnswer,
    questionStartedAt: storedSession.questionStartedAt ?? Date.now(),
    timedOut: storedSession.timedOut ?? false,
    artworkQueue: storedSession.artworkQueue,
    completed: storedSession.completed ?? false,
  };
}
