"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/components/language/LanguageProvider";
import { AppShell } from "@/components/layout/AppShell";
import { QuizCard } from "@/components/quiz/QuizCard";
import { QuizFinalPanel } from "@/components/quiz/QuizFinalPanel";
import { ScorePanel } from "@/components/quiz/ScorePanel";
import { artworks } from "@/lib/artworks";
import {
  getDifficultyQuizArtworks,
  generateQuizQuestion,
  generateRandomQuizQuestion,
} from "@/lib/quiz";
import { useQuestionTimer } from "@/lib/quiz-timer";
import {
  clearQuizSession,
  isActiveQuizSession,
  loadQuizSessionHybrid,
  saveQuizSession,
  saveQuizSessionHybrid,
  type QuizMode,
  type QuizSession,
} from "@/lib/quiz-session";
import { getArtTheme } from "@/lib/themes";
import type { Artwork, Difficulty } from "@/types";

const isDevelopment = process.env.NODE_ENV === "development";

const tenQuestionQuizModes = ["famous_10", "interested_10", "art_lover_10"] as const;

const tenQuestionQuizConfig: Record<
  (typeof tenQuestionQuizModes)[number],
  {
    difficulty: Difficulty;
    title: Record<"es" | "en", string>;
    shareTitle: Record<"es" | "en", string>;
  }
> = {
  famous_10: {
    difficulty: "easy",
    title: {
      es: "Quiz top 10",
      en: "Top 10 quiz",
    },
    shareTitle: {
      es: "Top 10",
      en: "Top 10",
    },
  },
  interested_10: {
    difficulty: "medium",
    title: {
      es: "Quiz Interesado",
      en: "Interested quiz",
    },
    shareTitle: {
      es: "Interesado",
      en: "Interested",
    },
  },
  art_lover_10: {
    difficulty: "hard",
    title: {
      es: "Quiz Amante del Arte",
      en: "Art Lover quiz",
    },
    shareTitle: {
      es: "Amante del Arte",
      en: "Art Lover",
    },
  },
};

function createClassicSession(): QuizSession {
  return {
    mode: "classic",
    round: 0,
    score: { correct: 0, total: 0, unanswered: 0 },
    question: generateRandomQuizQuestion(artworks),
    selectedAnswer: null,
    questionStartedAt: Date.now(),
    timedOut: false,
    completed: false,
  };
}

function isTenQuestionQuizMode(mode: QuizMode): mode is (typeof tenQuestionQuizModes)[number] {
  return tenQuestionQuizModes.includes(mode as (typeof tenQuestionQuizModes)[number]);
}

function getTenQuestionQuizArtworks(mode: QuizMode) {
  if (!isTenQuestionQuizMode(mode)) {
    throw new Error("Cannot build a 10-question quiz for classic mode.");
  }

  return getDifficultyQuizArtworks(artworks, tenQuestionQuizConfig[mode].difficulty);
}

function createTenQuestionQuizSession(mode: (typeof tenQuestionQuizModes)[number]): QuizSession {
  const quizArtworks = getTenQuestionQuizArtworks(mode);

  return {
    mode,
    round: 0,
    score: { correct: 0, total: 0, unanswered: 0 },
    question: generateQuizQuestion(quizArtworks[0], artworks),
    selectedAnswer: null,
    questionStartedAt: Date.now(),
    timedOut: false,
    artworkQueue: quizArtworks.map((artwork) => artwork.id),
    completed: false,
  };
}

function getNextTenQuestionQuizQuestion(session: QuizSession, nextRound: number) {
  const nextArtworkId = session.artworkQueue?.[nextRound];
  const nextArtwork = artworks.find((artwork) => artwork.id === nextArtworkId);

  if (!nextArtwork) {
    throw new Error("Cannot advance 10-question quiz without a valid artwork queue.");
  }

  return generateQuizQuestion(nextArtwork, artworks);
}

function createCompletedTenQuestionQuizSession(
  mode: (typeof tenQuestionQuizModes)[number],
): QuizSession {
  const quizArtworks = getTenQuestionQuizArtworks(mode);
  const finalArtwork = quizArtworks[quizArtworks.length - 1];
  const total = quizArtworks.length;
  const unanswered = Math.floor(Math.random() * 3);
  const correct = Math.floor(Math.random() * (total - unanswered + 1));

  return {
    mode,
    round: total - 1,
    score: { correct, total, unanswered },
    question: generateQuizQuestion(finalArtwork, artworks),
    selectedAnswer: null,
    questionStartedAt: Date.now(),
    timedOut: false,
    artworkQueue: quizArtworks.map((artwork) => artwork.id),
    completed: true,
  };
}

function getRequestedQuizMode(): QuizMode {
  const searchParams = new URLSearchParams(window.location.search);
  const requestedMode = searchParams.get("mode");

  if (requestedMode === "famous" || requestedMode === "top-10") return "famous_10";
  if (requestedMode === "interested") return "interested_10";
  if (requestedMode === "art-lover") return "art_lover_10";

  return "classic";
}

function getQueuedArtworks(session: QuizSession): Artwork[] {
  return session.artworkQueue
    ?.map((artworkId) => artworks.find((artwork) => artwork.id === artworkId))
    .filter((artwork): artwork is Artwork => Boolean(artwork)) ?? [session.question.artwork];
}

export default function QuizPage() {
  const { language } = useLanguage();
  const [session, setSession] = useState<QuizSession>(() => createClassicSession());
  const [hydrated, setHydrated] = useState(false);
  const tenQuestionSessionMode = isTenQuestionQuizMode(session.mode) ? session.mode : null;
  const totalQuestions = tenQuestionSessionMode ? session.artworkQueue?.length ?? 10 : undefined;
  const theme = getArtTheme(session.question.artwork.movement?.theme_key);
  const questionFinished = session.selectedAnswer !== null || Boolean(session.timedOut);
  const isClassicGameOver =
    session.mode === "classic" &&
    (session.timedOut ||
      (session.selectedAnswer !== null &&
        session.selectedAnswer !== session.question.correct_answer));
  const { remainingSeconds } = useQuestionTimer({
    startedAt: session.questionStartedAt,
    isRunning: hydrated && !questionFinished && !session.completed,
    onExpire: handleTimeExpired,
  });

  useEffect(() => {
    let cancelled = false;

    async function hydrateSession() {
      const requestedMode = getRequestedQuizMode();
      const storedSession = await loadQuizSessionHybrid(requestedMode);

      if (cancelled) return;

      if (storedSession && isActiveQuizSession(storedSession)) {
        setSession(storedSession);
      } else if (isTenQuestionQuizMode(requestedMode)) {
        const nextSession = createTenQuestionQuizSession(requestedMode);
        clearQuizSession(requestedMode);
        saveQuizSession(nextSession);
        void saveQuizSessionHybrid(nextSession);
        setSession(nextSession);
      } else if (storedSession) {
        setSession(storedSession);
      }

      setHydrated(true);
    }

    hydrateSession();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveQuizSession(session);
    void saveQuizSessionHybrid(session);
  }, [hydrated, session]);

  function handleAnswer(answer: string, isCorrect: boolean) {
    setSession((current) => {
      if (current.selectedAnswer || current.timedOut || current.completed) return current;

      const nextSession = {
        ...current,
        selectedAnswer: answer,
        timedOut: false,
        score: {
          correct: current.score.correct + (isCorrect ? 1 : 0),
          total: current.score.total + 1,
          unanswered: current.score.unanswered,
        },
      };

      saveQuizSession(nextSession);
      return nextSession;
    });
  }

  function handleTimeExpired() {
    setSession((current) => {
      if (current.selectedAnswer || current.timedOut || current.completed) return current;

      const nextSession = {
        ...current,
        selectedAnswer: null,
        timedOut: true,
        score: {
          correct: current.score.correct,
          total: current.score.total + 1,
          unanswered: current.score.unanswered + 1,
        },
      };

      saveQuizSession(nextSession);
      return nextSession;
    });
  }

  function handleNextQuestion() {
    setSession((current) => {
      if (isTenQuestionQuizMode(current.mode)) {
        const nextRound = current.round + 1;

        if (nextRound >= (current.artworkQueue?.length ?? 0)) {
          const completedSession = {
            ...current,
            completed: true,
          };

          saveQuizSession(completedSession);
          return completedSession;
        }

        const nextSession = {
          ...current,
          question: getNextTenQuestionQuizQuestion(current, nextRound),
          selectedAnswer: null,
          timedOut: false,
          questionStartedAt: Date.now(),
          round: nextRound,
        };

        saveQuizSession(nextSession);
        return nextSession;
      }

      const nextSession = {
        ...current,
        question: generateRandomQuizQuestion(artworks),
        selectedAnswer: null,
        timedOut: false,
        questionStartedAt: Date.now(),
        round: current.round + 1,
      };

      saveQuizSession(nextSession);
      return nextSession;
    });
  }

  function handleRestart() {
    const nextSession = isTenQuestionQuizMode(session.mode)
      ? createTenQuestionQuizSession(session.mode)
      : createClassicSession();

    clearQuizSession(session.mode);
    saveQuizSession(nextSession);
    void saveQuizSessionHybrid(nextSession);
    setSession(nextSession);
  }

  function handleDevSkipToShareResult() {
    const nextSession = createCompletedTenQuestionQuizSession(
      isTenQuestionQuizMode(session.mode) ? session.mode : "famous_10",
    );

    clearQuizSession(nextSession.mode);
    saveQuizSession(nextSession);
    void saveQuizSessionHybrid(nextSession);
    setSession(nextSession);
  }

  const title = tenQuestionSessionMode
    ? tenQuestionQuizConfig[tenQuestionSessionMode].title[language]
    : language === "es" ? "Quiz de obras famosas" : "Famous artworks quiz";

  const roundLabel =
    tenQuestionSessionMode && totalQuestions
      ? `${language === "es" ? "Pregunta" : "Question"} ${session.round + 1}/${totalQuestions}`
      : `${language === "es" ? "Ronda" : "Round"} ${session.round + 1}`;

  return (
    <AppShell themeKey={session.question.artwork.movement?.theme_key}>
      <div className="space-y-5">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-stone-700">
              {roundLabel}
            </p>
            <h1 className="font-serif text-4xl font-semibold text-stone-950">
              {title}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {isDevelopment ? (
              <button
                type="button"
                onClick={handleDevSkipToShareResult}
                className="rounded-full border border-rose-700/20 bg-rose-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-rose-700 transition hover:bg-rose-100"
              >
                {language === "es" ? "Dev: saltar 10" : "Dev: skip 10"}
              </button>
            ) : null}
            <ScorePanel correct={session.score.correct} total={session.score.total} />
          </div>
        </div>

        {isClassicGameOver ? (
          <QuizFinalPanel
            mode="classic"
            correctAnswers={session.score.correct}
            totalAnswers={session.score.total}
            unansweredAnswers={session.score.unanswered}
            roundReached={session.round + 1}
            artwork={session.question.artwork}
            questionType={session.question.question_type}
            selectedAnswer={session.selectedAnswer}
            correctAnswer={session.question.correct_answer}
            timedOut={session.timedOut}
            onRestart={handleRestart}
            buttonClassName={theme.button}
          />
        ) : session.completed && tenQuestionSessionMode ? (
          <QuizFinalPanel
            mode={tenQuestionSessionMode}
            correctAnswers={session.score.correct}
            totalAnswers={session.score.total}
            unansweredAnswers={session.score.unanswered}
            artwork={session.question.artwork}
            shareArtworks={getQueuedArtworks(session)}
            shareCardSubtitle={tenQuestionQuizConfig[tenQuestionSessionMode].shareTitle[language]}
            onRestart={handleRestart}
            buttonClassName={theme.button}
          />
        ) : (
          <QuizCard
            mode={session.mode}
            question={session.question}
            round={session.round + 1}
            correctAnswers={session.score.correct}
            totalQuestions={totalQuestions}
            selectedAnswer={session.selectedAnswer}
            timedOut={session.timedOut}
            remainingSeconds={remainingSeconds}
            onAnswer={handleAnswer}
            onNext={handleNextQuestion}
            onRestart={handleRestart}
          />
        )}
      </div>
    </AppShell>
  );
}
