"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo } from "react";
import { ArtworkImage } from "@/components/artwork/ArtworkImage";
import { useLanguage } from "@/components/language/LanguageProvider";
import { AnswerOption } from "@/components/quiz/AnswerOption";
import { GameOverPanel } from "@/components/quiz/GameOverPanel";
import { ResultPanel } from "@/components/quiz/ResultPanel";
import { getArtTheme } from "@/lib/themes";
import { cn } from "@/lib/utils";
import {
  getLocalizedQuestionPrompt,
  getLocalizedQuizAnswer,
} from "@/lib/localization";
import type { QuizMode } from "@/lib/quiz-session";
import type { QuizQuestion } from "@/types";

interface QuizCardProps {
  mode: QuizMode;
  question: QuizQuestion;
  round: number;
  correctAnswers: number;
  totalQuestions?: number;
  selectedAnswer: string | null;
  onAnswer: (answer: string, isCorrect: boolean) => void;
  onNext: () => void;
  onRestart: () => void;
}

export function QuizCard({
  mode,
  question,
  round,
  correctAnswers,
  totalQuestions,
  selectedAnswer,
  onAnswer,
  onNext,
  onRestart,
}: QuizCardProps) {
  const { language } = useLanguage();
  const theme = useMemo(
    () => getArtTheme(question.artwork.movement?.theme_key),
    [question.artwork.movement?.theme_key],
  );
  const isTenQuestionQuiz = mode !== "classic";
  const isLastQuestion = Boolean(totalQuestions && round >= totalQuestions);

  function handleSelect(option: string) {
    if (selectedAnswer) return;

    onAnswer(option, option === question.correct_answer);
  }

  function handleNext() {
    onNext();
  }

  function handleRestart() {
    onRestart();
  }

  return (
    <motion.section
      key={question.artwork.id + question.question_type}
      initial={{ opacity: 0, y: 18, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.99 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={cn(
        "grid gap-6 p-4 sm:p-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]",
        theme.card,
      )}
    >
      <div className="space-y-4">
        <div className="artwork-frame relative aspect-[4/3] overflow-hidden rounded-xl border border-white/40">
          <ArtworkImage artwork={question.artwork} eager fit="contain" withFiller />
        </div>
      </div>

      <div className="flex min-h-full flex-col justify-center space-y-5">
        <div>
          <p className={cn("text-sm font-bold uppercase tracking-[0.16em]", theme.accent)}>
            {language === "es" ? "Observa y responde" : "Look and answer"}
          </p>
          <h1 className="mt-2 font-serif text-3xl font-semibold sm:text-4xl">
            {getLocalizedQuestionPrompt(question.question_type, language)}
          </h1>
        </div>

        <div className="grid gap-3">
          {question.options.map((option) => (
            <AnswerOption
              key={option}
              option={option}
              label={getLocalizedQuizAnswer(question.question_type, option, language)}
              selected={selectedAnswer === option}
              disabled={Boolean(selectedAnswer)}
              isCorrect={option === question.correct_answer}
              onSelect={handleSelect}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {selectedAnswer && selectedAnswer === question.correct_answer ? (
            <ResultPanel
              key="result"
              question={question}
              selectedAnswer={selectedAnswer}
              onNext={handleNext}
              buttonClassName={theme.button}
              nextLabel={
                isTenQuestionQuiz && isLastQuestion
                  ? language === "es" ? "Ver resultado" : "See result"
                  : undefined
              }
            />
          ) : selectedAnswer && isTenQuestionQuiz ? (
            <ResultPanel
              key="result"
              question={question}
              selectedAnswer={selectedAnswer}
              onNext={handleNext}
              buttonClassName={theme.button}
              nextLabel={
                isLastQuestion
                  ? language === "es" ? "Ver resultado" : "See result"
                  : undefined
              }
            />
          ) : selectedAnswer ? (
            <GameOverPanel
              key="game-over"
              roundReached={round}
              correctAnswers={correctAnswers}
              selectedAnswer={selectedAnswer}
              correctAnswer={question.correct_answer}
              questionType={question.question_type}
              onRestart={handleRestart}
              buttonClassName={theme.button}
            />
          ) : null}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}
