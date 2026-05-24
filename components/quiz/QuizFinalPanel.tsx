"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { useLanguage } from "@/components/language/LanguageProvider";
import {
  getLocalizedArtworkTitle,
  getLocalizedQuizAnswer,
} from "@/lib/localization";
import { cn } from "@/lib/utils";
import type { QuizMode } from "@/lib/quiz-session";
import type { Artwork, QuestionType } from "@/types";

interface QuizFinalPanelProps {
  mode?: QuizMode;
  correctAnswers: number;
  totalAnswers: number;
  unansweredAnswers?: number;
  roundReached?: number;
  artwork: Artwork;
  questionType?: QuestionType;
  selectedAnswer?: string | null;
  correctAnswer?: string;
  timedOut?: boolean;
  shareArtworks?: Artwork[];
  shareCardSubtitle?: string;
  onRestart: () => void;
  buttonClassName?: string;
}

export function QuizFinalPanel({
  mode = "famous_10",
  correctAnswers,
  totalAnswers,
  unansweredAnswers = 0,
  roundReached,
  artwork,
  questionType,
  selectedAnswer,
  correctAnswer,
  timedOut = false,
  shareArtworks,
  shareCardSubtitle,
  onRestart,
  buttonClassName,
}: QuizFinalPanelProps) {
  const { language } = useLanguage();
  const [shareCardDataUrl, setShareCardDataUrl] = useState<string | null>(null);
  const [isPreparingShareCard, setIsPreparingShareCard] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [exportError, setExportError] = useState(false);
  const isClassicQuiz = mode === "classic";
  const scoreLabel = isClassicQuiz
    ? getClassicScoreLabel(correctAnswers, language)
    : language === "es"
      ? `${correctAnswers}/${totalAnswers} aciertos`
      : `${correctAnswers}/${totalAnswers} correct`;
  const shareTitle = "Pictoria";
  const resultShareCardSubtitle = shareCardSubtitle ?? (isClassicQuiz
    ? language === "es" ? "Modo Clásico" : "Classic Mode"
    : language === "es" ? "Top 10" : "Top 10");
  const fileName = isClassicQuiz
    ? `pictoria-clasico-${correctAnswers}-aciertos.png`
    : `pictoria-${correctAnswers}-de-${totalAnswers}.png`;
  const selectedAnswerLabel =
    timedOut
      ? language === "es" ? "Tiempo agotado" : "Time's up"
      : questionType && selectedAnswer
        ? getLocalizedQuizAnswer(questionType, selectedAnswer, language)
        : null;
  const correctAnswerLabel =
    questionType && correctAnswer
      ? getLocalizedQuizAnswer(questionType, correctAnswer, language)
      : null;

  async function handleOpenShareCard() {
    setIsPreparingShareCard(true);
    setExportError(false);

    try {
      const selectedArtwork = selectShareArtwork(shareArtworks ?? [artwork]);
      const artworkTitle = getLocalizedArtworkTitle(selectedArtwork, language);
      const dataUrl = await createShareCardPng({
        artworkTitle,
        imageUrl: getShareArtworkImageUrl(selectedArtwork),
        scoreLabel,
        shareCardSubtitle: resultShareCardSubtitle,
        artistName: selectedArtwork.artist?.name,
      });
      setShareCardDataUrl(dataUrl);
    } catch {
      setExportError(true);
    } finally {
      setIsPreparingShareCard(false);
    }
  }

  function handleDownloadPng() {
    if (!shareCardDataUrl) return;

    const link = document.createElement("a");
    link.href = shareCardDataUrl;
    link.download = fileName;
    link.click();
  }

  async function handleSharePng() {
    if (!shareCardDataUrl) return;

    setIsSharing(true);

    try {
      const file = await createPngFile(shareCardDataUrl, fileName);

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: shareTitle,
          text:
            language === "es"
              ? `Mi resultado en Pictoria: ${scoreLabel}`
              : `My Pictoria result: ${scoreLabel}`,
        });
      } else {
        handleDownloadPng();
      }
    } catch {
      // Cancelar el diálogo nativo de compartir también llega aquí.
    } finally {
      setIsSharing(false);
    }
  }

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 18, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="rounded-3xl border border-white/60 bg-white/80 p-8 text-stone-950 shadow-sm backdrop-blur"
      >
        <p
          className={cn(
            "inline-flex rounded-full px-3 py-1 text-sm font-bold",
            isClassicQuiz ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700",
          )}
        >
          {isClassicQuiz
            ? language === "es" ? "Partida terminada" : "Game over"
            : language === "es" ? "Quiz completado" : "Quiz complete"}
        </p>
        <h2 className="mt-4 font-serif text-4xl font-semibold">
          {isClassicQuiz
            ? language === "es"
              ? `Llegaste a la ronda ${roundReached ?? totalAnswers}`
              : `You reached round ${roundReached ?? totalAnswers}`
            : language === "es"
              ? `Acertaste ${correctAnswers} de ${totalAnswers}`
              : `You got ${correctAnswers} out of ${totalAnswers}`}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-700">
          {isClassicQuiz
            ? language === "es"
              ? `Tu score final fue ${scoreLabel}. Comparte tu resultado o empieza de nuevo para superar tu marca.`
              : `Your final score was ${scoreLabel}. Share your result or start again to beat your mark.`
            : language === "es"
              ? "Completaste este reto de 10 preguntas en Pictoria."
              : "You completed this 10-question Pictoria challenge."}
        </p>

        <div className="mt-5 inline-flex flex-wrap gap-5 rounded-2xl border border-stone-950/10 bg-white/70 px-5 py-3 shadow-sm">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-stone-500">
              Score
            </p>
            <p className="mt-1 text-2xl font-bold text-stone-950">{scoreLabel}</p>
          </div>
          {unansweredAnswers > 0 ? (
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-stone-500">
                {language === "es" ? "No respondidas" : "Unanswered"}
              </p>
              <p className="mt-1 text-2xl font-bold text-stone-950">{unansweredAnswers}</p>
            </div>
          ) : null}
        </div>

        {isClassicQuiz && selectedAnswerLabel && correctAnswerLabel ? (
          <div className="mt-5 grid gap-3 rounded-2xl border border-stone-950/10 bg-white/70 p-4 text-sm">
            <div>
              <p className="font-bold text-rose-700">
                {language === "es" ? "Tu respuesta" : "Your answer"}
              </p>
              <p className="mt-1 text-stone-700">{selectedAnswerLabel}</p>
            </div>
            <div>
              <p className="font-bold text-emerald-700">
                {language === "es" ? "Respuesta correcta" : "Correct answer"}
              </p>
              <p className="mt-1 text-stone-950">{correctAnswerLabel}</p>
            </div>
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleOpenShareCard}
            disabled={isPreparingShareCard}
            className={cn(
              "rounded-full px-5 py-2 text-sm font-bold shadow-sm transition",
              buttonClassName,
            )}
          >
            {isPreparingShareCard
              ? language === "es" ? "Generando..." : "Generating..."
              : language === "es" ? "Compartir resultado" : "Share result"}
          </button>
          <button
            type="button"
            onClick={onRestart}
            className={cn(
              "rounded-full px-5 py-2 text-sm font-bold shadow-sm transition",
              buttonClassName,
            )}
          >
            {isClassicQuiz
              ? language === "es" ? "Empezar de nuevo" : "Start again"
              : language === "es" ? "Reintentar reto" : "Retry challenge"}
          </button>
          <Link
            href="/"
            className="rounded-full border border-stone-950/10 bg-white/70 px-5 py-2 text-sm font-bold text-stone-950 shadow-sm transition hover:bg-white"
          >
            {language === "es" ? "Volver al inicio" : "Back home"}
          </Link>
        </div>

        {exportError ? (
          <p className="mt-4 text-sm leading-6 text-rose-700">
            {language === "es"
              ? "No pude generar la tarjeta. Intenta de nuevo en un momento."
              : "I could not generate the card. Try again in a moment."}
          </p>
        ) : null}
      </motion.section>

      {shareCardDataUrl ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={language === "es" ? "Tarjeta de resultado" : "Result card"}
        >
          <div className="grid max-h-[calc(100dvh-2rem)] w-full max-w-6xl gap-4 overflow-hidden rounded-3xl bg-stone-50 p-4 shadow-2xl sm:p-5 lg:grid-cols-[minmax(280px,0.75fr)_minmax(260px,0.55fr)] lg:items-center">
            <div className="flex min-h-0 justify-center overflow-hidden rounded-3xl bg-stone-950 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={shareCardDataUrl}
                alt={language === "es" ? "Tarjeta de resultado Pictoria" : "Pictoria result card"}
                className="block max-h-[calc(100dvh-4rem)] w-auto max-w-full object-contain"
              />
            </div>

            <div className="space-y-5 overflow-auto p-1 sm:p-2">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-rose-700">
                  {language === "es" ? "Lista para compartir" : "Ready to share"}
                </p>
                <h3 className="mt-2 font-serif text-3xl font-semibold text-stone-950">
                  {language === "es" ? "Tu tarjeta de resultado" : "Your result card"}
                </h3>
                <p className="mt-2 text-sm leading-6 text-stone-700">
                  {language === "es"
                    ? "Descarga el PNG o usa compartir para abrir las opciones de tu dispositivo, como WhatsApp."
                    : "Download the PNG or use share to open your device options, such as WhatsApp."}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleSharePng}
                  disabled={isSharing}
                  className="rounded-full bg-stone-950 px-5 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-stone-800 disabled:cursor-wait disabled:bg-stone-500"
                >
                  {isSharing
                    ? language === "es" ? "Abriendo..." : "Opening..."
                    : language === "es" ? "Compartir" : "Share"}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPng}
                  className="rounded-full border border-stone-950/10 bg-white px-5 py-2 text-sm font-bold text-stone-950 shadow-sm transition hover:bg-stone-100"
                >
                  {language === "es" ? "Descargar PNG" : "Download PNG"}
                </button>
                <button
                  type="button"
                  onClick={() => setShareCardDataUrl(null)}
                  className="rounded-full border border-stone-950/10 bg-transparent px-5 py-2 text-sm font-bold text-stone-700 transition hover:bg-stone-100"
                >
                  {language === "es" ? "Cerrar" : "Close"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function selectShareArtwork(artworks: Artwork[]) {
  if (artworks.length === 0) {
    throw new Error("Cannot select a share artwork from an empty list.");
  }

  return artworks[Math.floor(Math.random() * artworks.length)];
}

function getShareArtworkImageUrl(artwork: Artwork) {
  return artwork.cloudinary_url ?? artwork.thumbnail_url ?? artwork.image_url;
}

function getClassicScoreLabel(correctAnswers: number, language: "es" | "en") {
  if (language === "es") {
    return correctAnswers === 1
      ? "1 acierto seguido"
      : `${correctAnswers} aciertos seguidos`;
  }

  return correctAnswers === 1
    ? "1 correct answer"
    : `${correctAnswers} correct streak`;
}

interface ShareCardPngOptions {
  artworkTitle: string;
  artistName?: string;
  imageUrl: string;
  scoreLabel: string;
  shareCardSubtitle: string;
}

async function createShareCardPng({
  artworkTitle,
  artistName,
  imageUrl,
  scoreLabel,
  shareCardSubtitle,
}: ShareCardPngOptions) {
  const width = 1080;
  const height = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas is not available.");
  }

  context.fillStyle = "#1c1917";
  context.fillRect(0, 0, width, height);

  let objectUrl: string | null = null;

  try {
    objectUrl = await createImageObjectUrl(imageUrl);
    const image = await loadImage(objectUrl);
    drawCoverImage(context, image, 0, 0, width, height);
  } catch {
    context.fillStyle = "#44403c";
    context.fillRect(0, 0, width, height);
  } finally {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }
  }

  const gradient = context.createLinearGradient(0, 260, 0, height);
  gradient.addColorStop(0, "rgba(28, 25, 23, 0)");
  gradient.addColorStop(0.55, "rgba(28, 25, 23, 0.68)");
  gradient.addColorStop(1, "rgba(28, 25, 23, 0.98)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);

  context.fillStyle = "#ffffff";
  context.font = "700 104px Georgia, serif";
  drawWrappedText(context, scoreLabel, 72, 1018, 900, 112, 2);

  context.fillStyle = "rgba(255, 255, 255, 0.82)";
  context.font = "400 34px Arial, sans-serif";
  drawWrappedText(
    context,
    artistName ? `${artworkTitle} - ${artistName}` : artworkTitle,
    72,
    1190,
    920,
    44,
    2,
  );

  drawBrandLine(context, shareCardSubtitle, 72, 1270);

  return canvas.toDataURL("image/png");
}

function drawBrandLine(
  context: CanvasRenderingContext2D,
  subtitle: string,
  x: number,
  y: number,
) {
  context.fillStyle = "rgba(255, 255, 255, 0.9)";
  context.font = "700 38px Arial, sans-serif";
  context.fillText("Pictoria", x, y);

  const pictoriaWidth = context.measureText("Pictoria").width;
  const separatorX = x + pictoriaWidth + 28;
  const separatorTop = y - 30;

  context.strokeStyle = "rgba(255, 255, 255, 0.5)";
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(separatorX, separatorTop);
  context.lineTo(separatorX, y + 4);
  context.stroke();

  context.fillStyle = "rgba(255, 255, 255, 0.72)";
  context.font = "700 28px Arial, sans-serif";
  context.fillText(subtitle, separatorX + 28, y);
}

async function createImageObjectUrl(src: string) {
  const response = await fetch(src, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Image request failed with ${response.status}.`);
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

async function createPngFile(dataUrl: string, fileName: string) {
  const response = await fetch(dataUrl);
  const blob = await response.blob();

  return new File([blob], fileName, { type: "image/png" });
}

function drawCoverImage(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const scaledWidth = image.naturalWidth * scale;
  const scaledHeight = image.naturalHeight * scale;
  const offsetX = x + (width - scaledWidth) / 2;
  const offsetY = y + (height - scaledHeight) / 2;

  context.drawImage(image, offsetX, offsetY, scaledWidth, scaledHeight);
}

function drawWrappedText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
) {
  const words = text.split(" ");
  let line = "";
  let lineCount = 0;

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    const metrics = context.measureText(testLine);

    if (metrics.width > maxWidth && line) {
      context.fillText(line, x, y + lineCount * lineHeight);
      line = word;
      lineCount += 1;

      if (lineCount >= maxLines) return;
    } else {
      line = testLine;
    }
  }

  if (line && lineCount < maxLines) {
    context.fillText(line, x, y + lineCount * lineHeight);
  }
}
