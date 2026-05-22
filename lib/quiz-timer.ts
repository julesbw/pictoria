"use client";

import { useEffect, useRef, useState } from "react";

export const QUESTION_TIME_LIMIT = 10;

const questionTimeLimitMs = QUESTION_TIME_LIMIT * 1000;
const timerTickMs = 250;

interface UseQuestionTimerParams {
  startedAt: number;
  isRunning: boolean;
  onExpire: () => void;
}

export function useQuestionTimer({
  startedAt,
  isRunning,
  onExpire,
}: UseQuestionTimerParams) {
  const [remainingMs, setRemainingMs] = useState(questionTimeLimitMs);
  const onExpireRef = useRef(onExpire);
  const hasExpiredRef = useRef(false);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    hasExpiredRef.current = false;

    if (!isRunning) {
      setRemainingMs(0);
      return;
    }

    function tick() {
      const nextRemainingMs = Math.max(
        0,
        questionTimeLimitMs - (Date.now() - startedAt),
      );

      setRemainingMs(nextRemainingMs);

      if (nextRemainingMs === 0 && !hasExpiredRef.current) {
        hasExpiredRef.current = true;
        onExpireRef.current();
      }
    }

    tick();
    const intervalId = window.setInterval(tick, timerTickMs);

    return () => window.clearInterval(intervalId);
  }, [isRunning, startedAt]);

  return {
    remainingMs,
    remainingSeconds: Math.ceil(remainingMs / 1000),
  };
}
