"use client";

import { motion } from "framer-motion";
import { FavoriteButton } from "@/components/artwork/FavoriteButton";
import { useLanguage } from "@/components/language/LanguageProvider";
import {
  getLocalizedArtworkDescription,
  getLocalizedArtworkTitle,
  getLocalizedQuizAnswer,
} from "@/lib/localization";
import { cn } from "@/lib/utils";
import type { QuizQuestion } from "@/types";

interface ResultPanelProps {
  question: QuizQuestion;
  selectedAnswer: string | null;
  timedOut?: boolean;
  onNext: () => void;
  buttonClassName?: string;
  nextLabel?: string;
}

export function ResultPanel({
  question,
  selectedAnswer,
  timedOut = false,
  onNext,
  buttonClassName,
  nextLabel,
}: ResultPanelProps) {
  const { language } = useLanguage();
  const isCorrect = !timedOut && selectedAnswer === question.correct_answer;
  const title = getLocalizedArtworkTitle(question.artwork, language);
  const description = getLocalizedArtworkDescription(question.artwork, language);
  const correctAnswer = getLocalizedQuizAnswer(
    question.question_type,
    question.correct_answer,
    language,
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.25 }}
      className="space-y-4 rounded-2xl border border-white/50 bg-white/75 p-5 text-stone-950 shadow-sm"
    >
      <div>
        <p
          className={cn(
            "inline-flex rounded-full px-3 py-1 text-sm font-bold",
            isCorrect ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700",
          )}
        >
          {isCorrect
            ? language === "es" ? "Correcto" : "Correct"
            : timedOut
              ? language === "es" ? "Tiempo agotado" : "Time's up"
            : language === "es" ? "Incorrecto" : "Incorrect"}
        </p>
        <h3 className="mt-1 font-serif text-2xl font-semibold">
          {title}
        </h3>
        <div className="mt-3 grid gap-2 rounded-xl border border-stone-950/10 bg-white/70 p-3 text-sm text-stone-700">
          <p>
            <span className="font-bold text-stone-950">
              {language === "es" ? "Obra:" : "Artwork:"}
            </span>{" "}
            {title}
          </p>
          <p>
            <span className="font-bold text-stone-950">
              {language === "es" ? "Autor:" : "Artist:"}
            </span>{" "}
            {question.artwork.artist?.name ?? (language === "es" ? "Artista desconocido" : "Unknown artist")}
          </p>
          <p>
            <span className="font-bold text-stone-950">
              {language === "es" ? "Respuesta correcta:" : "Correct answer:"}
            </span>{" "}
            {correctAnswer}
          </p>
        </div>
      </div>

      <p className="text-sm leading-6 text-stone-700">{description}</p>

      <div className="flex flex-wrap gap-3">
        <FavoriteButton artworkId={question.artwork.id} />
        <button
          type="button"
          onClick={onNext}
          className={cn(
            "rounded-full px-5 py-2 text-sm font-bold shadow-sm transition",
            buttonClassName,
          )}
        >
          {nextLabel ?? (language === "es" ? "Siguiente obra" : "Next artwork")}
        </button>
      </div>
    </motion.section>
  );
}
