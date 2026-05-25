"use client";

import Link from "next/link";
import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import { ArtworkCard } from "@/components/artwork/ArtworkCard";
import { useLanguage } from "@/components/language/LanguageProvider";
import {
  hasActiveQuizSessionHybrid,
  hasResumableQuizSessionHybrid,
} from "@/lib/quiz-session";
import type { Artwork } from "@/types";

interface HomeContentProps {
  featuredArtworks: Artwork[];
}

const copy = {
  es: {
    eyebrow: "Museo quiz local",
    title: "Aprende arte mirando, jugando y equivocándote bonito.",
    description:
      "Pictoria te muestra una pintura famosa y te reta a reconocer su artista, título o movimiento. Después de cada respuesta recibes contexto breve para aprender sin salir del flujo.",
    play: "Jugar Clásico",
    resumeClassicQuiz: "Reanudar",
    quiz: "Jugar Quiz",
    quizModalEyebrow: "Elige dificultad",
    quizModalTitle: "Reto de 10 preguntas",
    quizModalDescription:
      "En estos modos los errores no terminan la partida. Responde las 10 preguntas y comparte tu marcador final.",
    famousQuiz: "Top 10",
    continueFamousQuiz: "Continuar Top 10",
    famousQuizDescription: "Dificultad fácil, ideal para calentar.",
    interestedQuiz: "Interesado",
    continueInterestedQuiz: "Continuar Interesado",
    interestedQuizDescription: "Dificultad media, para reconocer más contexto.",
    artLoverQuiz: "Amante del Arte",
    continueArtLoverQuiz: "Continuar Amante del Arte",
    artLoverQuizDescription: "Dificultad alta, con obras menos obvias.",
    close: "Cerrar",
    explore: "Explorar obras",
  },
  en: {
    eyebrow: "Local museum quiz",
    title: "Learn art by looking, playing, and getting it beautifully wrong.",
    description:
      "Pictoria shows you a famous painting and challenges you to recognize its artist, title, or movement. After each answer, you get brief context so you can keep learning in the flow.",
    play: "Play Classic",
    resumeClassicQuiz: "Resume",
    quiz: "Play Quiz",
    quizModalEyebrow: "Choose difficulty",
    quizModalTitle: "10-question challenge",
    quizModalDescription:
      "In these modes, mistakes do not end the game. Answer all 10 questions and share your final score.",
    famousQuiz: "Top 10",
    continueFamousQuiz: "Continue top 10",
    famousQuizDescription: "Easy difficulty, perfect as a warm-up.",
    interestedQuiz: "Interested",
    continueInterestedQuiz: "Continue Interested",
    interestedQuizDescription: "Medium difficulty, for recognizing more context.",
    artLoverQuiz: "Art Lover",
    continueArtLoverQuiz: "Continue Art Lover",
    artLoverQuizDescription: "Hard difficulty, with less obvious artworks.",
    close: "Close",
    explore: "Explore artworks",
  },
};

export function HomeContent({ featuredArtworks }: HomeContentProps) {
  const { language } = useLanguage();
  const text = copy[language];
  const heroRef = useRef<HTMLElement | null>(null);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<HTMLDivElement[]>([]);
  const isQuizModalOpenRef = useRef(false);
  const touchStartXRef = useRef<number | null>(null);
  const [hasActiveClassicSession, setHasActiveClassicSession] = useState(false);
  const [hasActiveFamousSession, setHasActiveFamousSession] = useState(false);
  const [hasActiveInterestedSession, setHasActiveInterestedSession] = useState(false);
  const [hasActiveArtLoverSession, setHasActiveArtLoverSession] = useState(false);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function syncQuizSessions() {
      const [
        hasClassicSession,
        hasFamousSession,
        hasInterestedSession,
        hasArtLoverSession,
      ] = await Promise.all([
        hasResumableQuizSessionHybrid("classic"),
        hasActiveQuizSessionHybrid("famous_10"),
        hasActiveQuizSessionHybrid("interested_10"),
        hasActiveQuizSessionHybrid("art_lover_10"),
      ]);

      if (cancelled) return;

      setHasActiveClassicSession(hasClassicSession);
      setHasActiveFamousSession(hasFamousSession);
      setHasActiveInterestedSession(hasInterestedSession);
      setHasActiveArtLoverSession(hasArtLoverSession);
    }

    syncQuizSessions();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    isQuizModalOpenRef.current = isQuizModalOpen;
  }, [isQuizModalOpen]);

  useEffect(() => {
    const carousel = carouselRef.current;
    const cards = cardRefs.current.filter(Boolean);

    if (!heroRef.current || !carousel || cards.length === 0) return;

    const total = cards.length;
    const media = gsap.matchMedia();

    media.add("(min-width: 1024px)", () => {
      gsap.set(carousel, {
        perspective: 1400,
        transformStyle: "preserve-3d",
      });

      const maxScrollOffset = Math.max(0, total - 1);
      const scrollOffset = { current: 0 };

      function renderCarousel(nextOffset: number, duration = 0.45) {
        scrollOffset.current = wrapCarouselOffset(nextOffset, total);

        cards.forEach((card, index) => {
          const state = getHeroCarouselCardState(index, total, scrollOffset.current);

          gsap.to(card, {
            x: state.x,
            y: state.y,
            z: state.z,
            rotateY: state.rotateY,
            rotateZ: state.rotateZ,
            scale: state.scale,
            opacity: state.opacity,
            zIndex: state.zIndex,
            duration,
            ease: "power2.out",
            overwrite: "auto",
          });
        });

        gsap.to(carousel, {
          rotateY: Math.sin(scrollOffset.current * Math.PI * 0.55) * 2.5,
          rotateX: Math.cos(scrollOffset.current * Math.PI * 0.4) * 1,
          duration: Math.max(duration, 0.5),
          ease: "power1.out",
          overwrite: "auto",
        });
      }

      cards.forEach((card, index) => {
        const initialState = getHeroCarouselCardState(index, total, 0);

        gsap.set(card, {
          xPercent: -50,
          yPercent: -50,
          ...initialState,
          transformStyle: "preserve-3d",
          transformOrigin: "50% 70%",
        });
      });

      function handleWheel(event: WheelEvent) {
        if (isQuizModalOpenRef.current || maxScrollOffset === 0) return;

        event.preventDefault();
        renderCarousel(scrollOffset.current + event.deltaY / 420);
      }

      window.addEventListener("wheel", handleWheel, { passive: false });

      return () => {
        window.removeEventListener("wheel", handleWheel);
        gsap.killTweensOf([carousel, ...cards]);
      };
    });

    media.add("(max-width: 1023px)", () => {
      const maxScrollOffset = Math.max(0, total - 1);
      const scrollOffset = { current: 0 };
      const spacing = 84;

      gsap.set(carousel, {
        perspective: 1000,
        transformStyle: "preserve-3d",
      });

      function renderCarousel(nextOffset: number, duration = 0.4) {
        scrollOffset.current = wrapCarouselOffset(nextOffset, total);

        cards.forEach((card, index) => {
          const state = getHeroCarouselCardState(index, total, scrollOffset.current, spacing);

          gsap.to(card, {
            x: state.x,
            y: state.y,
            z: state.z,
            rotateY: state.rotateY,
            rotateZ: state.rotateZ,
            scale: state.scale,
            opacity: state.opacity,
            zIndex: state.zIndex,
            duration,
            ease: "power2.out",
            overwrite: "auto",
          });
        });
      }

      cards.forEach((card, index) => {
        const initialState = getHeroCarouselCardState(index, total, 0, spacing);

        gsap.set(card, {
          xPercent: -50,
          yPercent: -50,
          ...initialState,
          transformStyle: "preserve-3d",
          transformOrigin: "50% 70%",
        });
      });

      function handleTouchStart(event: TouchEvent) {
        touchStartXRef.current = event.touches[0]?.clientX ?? null;
      }

      function handleTouchEnd(event: TouchEvent) {
        const startX = touchStartXRef.current;
        const endX = event.changedTouches[0]?.clientX;
        touchStartXRef.current = null;

        if (startX === null || endX === undefined) return;

        const deltaX = endX - startX;
        if (Math.abs(deltaX) < 44) return;

        renderCarousel(scrollOffset.current + (deltaX < 0 ? 1 : -1));
      }

      carousel.addEventListener("touchstart", handleTouchStart, { passive: true });
      carousel.addEventListener("touchend", handleTouchEnd, { passive: true });

      return () => {
        carousel.removeEventListener("touchstart", handleTouchStart);
        carousel.removeEventListener("touchend", handleTouchEnd);
        gsap.killTweensOf([carousel, ...cards]);
      };
    });

    return () => media.revert();
  }, [featuredArtworks]);

  return (
    <section
      ref={heroRef}
      className="grid min-h-[calc(100dvh-11rem)] items-start gap-10 overflow-x-hidden py-6 lg:h-[calc(100dvh-18rem)] lg:min-h-[35rem] lg:grid-cols-[0.9fr_1.1fr] lg:overflow-visible lg:py-0 lg:pt-8"
    >
      <div className="relative z-10 space-y-6">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-rose-700">
          {text.eyebrow}
        </p>

        <div className="space-y-4">
          <h1 className="font-serif text-5xl font-semibold leading-tight text-stone-950 sm:text-6xl">
            {text.title}
          </h1>
          <p className="max-w-xl text-lg leading-8 text-stone-700">
            {text.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/quiz"
            className="rounded-full bg-stone-950 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-stone-800"
          >
            {hasActiveClassicSession ? text.resumeClassicQuiz : text.play}
          </Link>
          <button
            type="button"
            onClick={() => setIsQuizModalOpen(true)}
            className="rounded-full bg-rose-700 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-rose-800"
          >
            {text.quiz}
          </button>
          <Link
            href="/explore"
            className="rounded-full border border-stone-950/10 bg-white/70 px-6 py-3 text-sm font-bold text-stone-950 shadow-sm transition hover:bg-white"
          >
            {text.explore}
          </Link>
        </div>
      </div>

      <div
        ref={carouselRef}
        className="relative min-h-[420px] overflow-hidden [touch-action:pan-y] [transform-style:preserve-3d] sm:min-h-[500px] lg:h-[500px] lg:min-h-0 lg:translate-y-8 lg:overflow-visible"
      >
        {featuredArtworks.map((artwork, index) => (
          <div
            key={artwork.id}
            ref={(element) => {
              if (element) cardRefs.current[index] = element;
            }}
            className="absolute left-1/2 top-1/2 w-[min(78vw,17rem)] sm:w-72 lg:w-80"
            style={{
              zIndex: getHeroCarouselCardState(index, featuredArtworks.length, 0, 84).zIndex,
              transform: getHeroCarouselTransform(index, featuredArtworks.length, 0, 84),
              opacity: getHeroCarouselCardState(index, featuredArtworks.length, 0, 84).opacity,
            }}
          >
            <ArtworkCard
              artwork={artwork}
              enableHoverEffects={false}
              enableDetailModal={false}
              showFavoriteButton={false}
            />
          </div>
        ))}
      </div>

      {isQuizModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/75 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="quiz-mode-title"
        >
          <div className="w-full max-w-2xl rounded-3xl border border-white/60 bg-stone-50 p-6 text-stone-950 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-rose-700">
                  {text.quizModalEyebrow}
                </p>
                <h2 id="quiz-mode-title" className="mt-2 font-serif text-4xl font-semibold">
                  {text.quizModalTitle}
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-stone-700">
                  {text.quizModalDescription}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsQuizModalOpen(false)}
                className="shrink-0 rounded-full border border-stone-950/10 bg-white px-4 py-2 text-sm font-bold text-stone-700 shadow-sm transition hover:bg-stone-100"
              >
                {text.close}
              </button>
            </div>

            <div className="mt-6 grid gap-3">
              <QuizModeLink
                href="/quiz?mode=famous"
                title={hasActiveFamousSession ? text.continueFamousQuiz : text.famousQuiz}
                description={text.famousQuizDescription}
                tone="rose"
              />
              <QuizModeLink
                href="/quiz?mode=interested"
                title={hasActiveInterestedSession ? text.continueInterestedQuiz : text.interestedQuiz}
                description={text.interestedQuizDescription}
                tone="amber"
              />
              <QuizModeLink
                href="/quiz?mode=art-lover"
                title={hasActiveArtLoverSession ? text.continueArtLoverQuiz : text.artLoverQuiz}
                description={text.artLoverQuizDescription}
                tone="violet"
              />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

interface QuizModeLinkProps {
  href: string;
  title: string;
  description: string;
  tone: "rose" | "amber" | "violet";
}

const quizModeLinkStyles: Record<QuizModeLinkProps["tone"], string> = {
  rose: "border-rose-700/15 bg-rose-50 hover:bg-rose-100",
  amber: "border-amber-700/15 bg-amber-50 hover:bg-amber-100",
  violet: "border-violet-800/15 bg-violet-50 hover:bg-violet-100",
};

const quizModeTitleStyles: Record<QuizModeLinkProps["tone"], string> = {
  rose: "text-rose-800",
  amber: "text-amber-800",
  violet: "text-violet-900",
};

function QuizModeLink({ href, title, description, tone }: QuizModeLinkProps) {
  return (
    <Link
      href={href}
      className={`block rounded-2xl border p-4 shadow-sm transition ${quizModeLinkStyles[tone]}`}
    >
      <p className={`text-lg font-bold ${quizModeTitleStyles[tone]}`}>{title}</p>
      <p className="mt-1 text-sm leading-6 text-stone-700">{description}</p>
    </Link>
  );
}

function getHeroCarouselColumn(index: number, total: number, scrollOffset: number) {
  let position = ((index - scrollOffset) % total + total) % total;

  if (position > total / 2) {
    position -= total;
  }

  return position;
}

function wrapCarouselOffset(offset: number, total: number) {
  return ((offset % total) + total) % total;
}

function getHeroCarouselCardState(
  index: number,
  total: number,
  scrollOffset: number,
  spacing = 240,
) {
  const column = getHeroCarouselColumn(index, total, scrollOffset);
  const absoluteColumn = Math.abs(column);
  const isVisible = absoluteColumn <= 1.5;
  const x = column * spacing;
  const y = absoluteColumn < 0.5 ? 16 : 0;
  const z = -absoluteColumn * 78;
  const scale = Math.max(0.78, 1 - absoluteColumn * 0.16);
  const opacity = isVisible ? Math.max(0.28, 1 - absoluteColumn * 0.5) : 0;
  const zIndex = Math.round(30 - absoluteColumn * 5);

  return {
    x,
    y,
    z,
    rotateY: column * -6,
    rotateZ: column * 2,
    scale,
    opacity,
    zIndex,
  };
}

function getHeroCarouselTransform(
  index: number,
  total: number,
  scrollOffset: number,
  spacing = 240,
) {
  const state = getHeroCarouselCardState(index, total, scrollOffset, spacing);

  return `translate(-50%, -50%) translate3d(${state.x}px, ${state.y}px, ${state.z}px) rotateY(${state.rotateY}deg) rotate(${state.rotateZ}deg) scale(${state.scale})`;
}
