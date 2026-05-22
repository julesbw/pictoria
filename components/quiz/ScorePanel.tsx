"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/components/language/LanguageProvider";

interface ScorePanelProps {
  correct: number;
  total: number;
}

export function ScorePanel({ correct, total }: ScorePanelProps) {
  const { language } = useLanguage();
  const percentage = total === 0 ? 0 : Math.round((correct / total) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-3 overflow-hidden rounded-2xl border border-white/50 bg-white/70 text-center text-stone-950 shadow-sm backdrop-blur sm:min-w-80"
    >
      <div className="border-r border-stone-950/10 p-3">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-stone-500">
          {language === "es" ? "Correctas" : "Correct"}
        </p>
        <p className="mt-1 text-2xl font-bold">{correct}</p>
      </div>
      <div className="border-r border-stone-950/10 p-3">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-stone-500">
          Total
        </p>
        <p className="mt-1 text-2xl font-bold">{total}</p>
      </div>
      <div className="p-3">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-stone-500">
          {language === "es" ? "Acierto" : "Accuracy"}
        </p>
        <p className="mt-1 text-2xl font-bold">{percentage}%</p>
      </div>
    </motion.div>
  );
}
