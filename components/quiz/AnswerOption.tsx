"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnswerOptionProps {
  option: string;
  label?: string;
  selected: boolean;
  disabled: boolean;
  isCorrect?: boolean;
  onSelect: (option: string) => void;
}

export function AnswerOption({
  option,
  label = option,
  selected,
  disabled,
  isCorrect,
  onSelect,
}: AnswerOptionProps) {
  const answered = disabled;

  return (
    <motion.button
      type="button"
      whileHover={disabled ? undefined : { y: -2 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      onClick={() => onSelect(option)}
      disabled={disabled}
      className={cn(
        "min-h-14 w-full rounded-xl border border-stone-950/10 bg-white/75 px-4 py-3 text-left text-sm font-semibold text-stone-900 shadow-sm transition disabled:cursor-default",
        !disabled && "hover:border-stone-950/25 hover:bg-white",
        answered && isCorrect && "border-emerald-500 bg-emerald-50 text-emerald-800",
        answered && selected && !isCorrect && "border-rose-500 bg-rose-50 text-rose-800",
        answered && !selected && !isCorrect && "opacity-70",
      )}
    >
      {label}
    </motion.button>
  );
}
