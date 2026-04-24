import React from "react";
import { motion } from "motion/react";
import { Sparkles, X } from "lucide-react";
import { AppMode, Platform } from "../types";
import { cn } from "../lib/utils";

interface RefinePanelProps {
  questions: string[];
  answers: string[];
  onAnswerChange: (index: number, value: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
  mode: AppMode;
  platform: Platform;
}

export const RefinePanel: React.FC<RefinePanelProps> = ({
  questions,
  answers,
  onAnswerChange,
  onCancel,
  onSubmit,
  mode,
  platform,
}) => {
  if (!questions.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.98 }}
      className={cn(
        "mt-5 rounded-[28px] md:rounded-[32px] border p-5 md:p-6 backdrop-blur-2xl shadow-2xl",
        "bg-white/75 dark:bg-[#080808]/75 border-neutral-200 dark:border-white/10"
      )}
    >
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-start gap-3">
          <div className={cn(
            "w-10 h-10 rounded-2xl flex items-center justify-center border",
            "bg-neutral-50 dark:bg-white/5 border-neutral-100 dark:border-white/10"
          )}>
            <Sparkles className={cn(
              "w-4 h-4",
              "text-indigo-500"
            )} />
          </div>
          <div>
            <h3 className="text-[13px] font-black uppercase tracking-[0.18em]">
              Refine before generating
            </h3>
            <p className={cn(
              "text-[12px] leading-relaxed mt-1 max-w-xl font-medium",
              "text-neutral-500 dark:text-neutral-400"
            )}>
              A few details can help Promptuno create a stronger {platform} prompt without slowing you down.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className={cn(
            "p-2 rounded-xl transition-colors",
            "text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/5"
          )}
          aria-label="Close refine questions"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        {questions.map((question, index) => (
          <label key={question} className="block">
            <span className={cn(
              "block text-[10px] font-black uppercase tracking-[0.16em] mb-2",
              "text-neutral-400"
            )}>
              {question}
            </span>
            <input
              value={answers[index] || ""}
              onChange={(event) => onAnswerChange(index, event.target.value)}
              placeholder="Optional, but useful"
              className={cn(
                "w-full rounded-2xl border px-4 py-3 bg-transparent outline-none text-[14px] font-medium transition-colors",
                "border-neutral-200 dark:border-white/10 placeholder-neutral-300 dark:placeholder-neutral-700 focus:border-neutral-900 dark:focus:border-white"
              )}
            />
          </label>
        ))}
      </div>

      <div className="mt-5 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.16em] text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          Skip
        </button>
        <button
          type="button"
          onClick={onSubmit}
          className={cn(
            "px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.16em] transition-all active:scale-95",
            "bg-black dark:bg-white text-white dark:text-black"
          )}
        >
          Generate Stronger Prompt
        </button>
      </div>
    </motion.div>
  );
};
