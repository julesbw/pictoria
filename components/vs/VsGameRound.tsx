"use client";

import { ArtworkImage } from "@/components/artwork/ArtworkImage";
import { useLanguage } from "@/components/language/LanguageProvider";
import { AnswerOption } from "@/components/quiz/AnswerOption";
import {
  getLocalizedQuestionPrompt,
  getLocalizedQuizAnswer,
} from "@/lib/localization";
import {
  buildQuizQuestionFromVsRound,
  didAllVsPlayersAnswerCurrentRound,
  getCurrentUserVsAnswer,
  type VsRoomState,
  type VsRound,
} from "@/lib/vs";

interface VsGameRoundProps {
  state: VsRoomState;
  round: VsRound;
  loading: boolean;
  error: string | null;
  onAnswer: (answer: string) => void;
  onLeave: () => void;
}

export function VsGameRound({
  state,
  round,
  loading,
  error,
  onAnswer,
  onLeave,
}: VsGameRoundProps) {
  const { language } = useLanguage();
  const question = buildQuizQuestionFromVsRound(round);
  const selectedAnswer = getCurrentUserVsAnswer(state);
  const allAnswered = didAllVsPlayersAnswerCurrentRound(state);
  const answeredCount = state.answers.filter((answer) => answer.roundId === round.id).length;

  if (!question) {
    return (
      <section className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm font-semibold text-rose-700">
        {language === "es" ? "No se pudo cargar la pregunta." : "The question could not load."}
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-stone-700">
            {language === "es" ? "Ronda" : "Round"} {state.room.currentRound}/{state.room.totalRounds}
          </p>
          <h1 className="font-serif text-4xl font-semibold text-stone-950">
            {language === "es" ? "Duelo VS" : "VS duel"}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {state.players.map((player, index) => (
            <div
              key={player.id}
              className="rounded-full border border-stone-950/10 bg-white/75 px-4 py-2 text-sm font-bold text-stone-800 shadow-sm"
            >
              {player.userId === state.currentUserId
                ? language === "es" ? "Tú" : "You"
                : `${language === "es" ? "Rival" : "Opponent"} ${index + 1}`}
              : {player.score}
            </div>
          ))}
          <button
            type="button"
            onClick={onLeave}
            className="rounded-full border border-stone-950/10 bg-white/75 px-4 py-2 text-sm font-bold text-stone-700 transition hover:bg-white"
          >
            {language === "es" ? "Salir" : "Leave"}
          </button>
        </div>
      </div>

      <div className="grid gap-6 rounded-2xl border border-stone-950/10 bg-white/75 p-4 shadow-sm sm:p-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
        <div className="artwork-frame relative aspect-[4/3] overflow-hidden rounded-xl border border-white/40">
          <ArtworkImage artwork={question.artwork} eager fit="contain" withFiller />
        </div>

        <div className="flex min-h-full flex-col justify-center space-y-5">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-stone-600">
                {language === "es" ? "Pregunta compartida" : "Shared question"}
              </p>
              <p className="rounded-full border border-stone-950/10 bg-white px-3 py-1 text-sm font-bold text-stone-700">
                {answeredCount}/2
              </p>
            </div>
            <h2 className="mt-2 font-serif text-3xl font-semibold sm:text-4xl">
              {getLocalizedQuestionPrompt(question.question_type, language)}
            </h2>
          </div>

          <div className="grid gap-3">
            {question.options.map((option) => (
              <AnswerOption
                key={option}
                option={option}
                label={getLocalizedQuizAnswer(question.question_type, option, language)}
                selected={selectedAnswer?.selectedOption === option}
                disabled={Boolean(selectedAnswer) || loading}
                isCorrect={option === question.correct_answer}
                onSelect={onAnswer}
              />
            ))}
          </div>

          {selectedAnswer ? (
            <div className="rounded-xl border border-stone-950/10 bg-white px-4 py-3 text-sm font-semibold text-stone-800">
              {selectedAnswer.isCorrect
                ? language === "es" ? "Correcto: +100 puntos." : "Correct: +100 points."
                : language === "es" ? "Incorrecto: +0 puntos." : "Incorrect: +0 points."}
              {!allAnswered ? (
                <span className="block pt-1 text-stone-600">
                  {language === "es" ? "Esperando al rival..." : "Waiting for opponent..."}
                </span>
              ) : null}
            </div>
          ) : null}

          {error ? (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
