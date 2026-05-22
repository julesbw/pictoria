import { artworks, getArtworkById } from "@/lib/artworks";
import { generateQuizQuestion } from "@/lib/quiz";
import type { QuizQuestion, QuestionType } from "@/types";

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

export function hasResumableQuizSession(mode: QuizMode) {
  const session = loadQuizSession(mode);

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
