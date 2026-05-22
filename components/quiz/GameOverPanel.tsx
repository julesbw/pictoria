"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/components/language/LanguageProvider";
import { getLocalizedQuizAnswer } from "@/lib/localization";
import { cn } from "@/lib/utils";
import type { QuestionType } from "@/types";

interface GameOverPanelProps {
  roundReached: number;
  correctAnswers: number;
  selectedAnswer: string | null;
  correctAnswer: string;
  questionType: QuestionType;
  timedOut?: boolean;
  onRestart: () => void;
  buttonClassName?: string;
}

export function GameOverPanel({
  roundReached,
  correctAnswers,
  selectedAnswer,
  correctAnswer,
  questionType,
  timedOut = false,
  onRestart,
  buttonClassName,
}: GameOverPanelProps) {
  const { language } = useLanguage();
  const selectedLabel = timedOut
    ? language === "es" ? "Tiempo agotado" : "Time's up"
    : selectedAnswer
      ? getLocalizedQuizAnswer(questionType, selectedAnswer, language)
      : language === "es" ? "Sin respuesta" : "No answer";
  const correctLabel = getLocalizedQuizAnswer(questionType, correctAnswer, language);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="rounded-2xl border border-white/60 bg-white/80 p-6 text-stone-950 shadow-sm backdrop-blur"
    >
      <p className="inline-flex rounded-full bg-rose-50 px-3 py-1 text-sm font-bold text-rose-700">
        {language === "es" ? "Partida terminada" : "Game over"}
      </p>
      <h2 className="mt-4 font-serif text-3xl font-semibold">
        {language === "es"
          ? `Llegaste a la ronda ${roundReached}`
          : `You reached round ${roundReached}`}
      </h2>
      <p className="mt-2 text-sm leading-6 text-stone-700">
        {language === "es"
          ? `Respuestas correctas antes de fallar: ${correctAnswers}. Reinicia para intentar superar tu marca.`
          : `Correct answers before missing: ${correctAnswers}. Restart to try to beat your score.`}
      </p>

      <div className="mt-5 grid gap-3 rounded-2xl border border-stone-950/10 bg-white/70 p-4 text-sm">
        <div>
          <p className="font-bold text-rose-700">
            {language === "es" ? "Tu respuesta" : "Your answer"}
          </p>
          <p className="mt-1 text-stone-700">{selectedLabel}</p>
        </div>
        <div>
          <p className="font-bold text-emerald-700">
            {language === "es" ? "Respuesta correcta" : "Correct answer"}
          </p>
          <p className="mt-1 text-stone-950">{correctLabel}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onRestart}
        className={cn(
          "mt-5 rounded-full px-5 py-2 text-sm font-bold shadow-sm transition",
          buttonClassName,
        )}
      >
        {language === "es" ? "Empezar de nuevo" : "Start again"}
      </button>
    </motion.section>
  );
}
