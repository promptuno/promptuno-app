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
        mode === "Code"
          ? "bg-black/80 border-green-500/20 text-green-400"
          : mode === "Image"
            ? "bg-white/70 dark:bg-black/70 border-purple-500/20 text-purple-900 dark:text-purple-100"
            : "bg-white/75 dark:bg-[#080808]/75 border-neutral-200 dark:border-white/10"
      )}
    >
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-start gap-3">
          <div className={cn(
            "w-10 h-10 rounded-2xl flex items-center justify-center border",
            mode === "Code"
              ? "bg-green-500/10 border-green-500/20"
              : mode === "Image"
                ? "bg-purple-500/10 border-purple-500/20"
                : "bg-neutral-50 dark:bg-white/5 border-neutral-100 dark:border-white/10"
          )}>
            <Sparkles className={cn(
              "w-4 h-4",
              mode === "Code" ? "text-green-400" : mode === "Image" ? "text-purple-500" : "text-indigo-500"
            )} />
          </div>
          <div>
            <h3 className="text-[13px] font-black uppercase tracking-[0.18em]">
              Refine before forging
            </h3>
            <p className={cn(
              "text-[12px] leading-relaxed mt-1 max-w-xl font-medium",
              mode === "Code" ? "text-green-500/55" : "text-neutral-500 dark:text-neutral-400"
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
            mode === "Code" ? "text-green-700 hover:text-green-300 hover:bg-green-500/10" : "text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/5"
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
              mode === "Code" ? "text-green-500/60" : mode === "Image" ? "text-purple-500/70" : "text-neutral-400"
            )}>
              {question}
            </span>
            <input
              value={answers[index] || ""}
              onChange={(event) => onAnswerChange(index, event.target.value)}
              placeholder="Optional, but useful"
              className={cn(
                "w-full rounded-2xl border px-4 py-3 bg-transparent outline-none text-[14px] font-medium transition-colors",
                mode === "Code"
                  ? "border-green-500/20 text-green-300 placeholder-green-900 focus:border-green-500/50"
                  : mode === "Image"
                    ? "border-purple-500/20 placeholder-purple-300 dark:placeholder-purple-900 focus:border-purple-500/50"
                    : "border-neutral-200 dark:border-white/10 placeholder-neutral-300 dark:placeholder-neutral-700 focus:border-neutral-900 dark:focus:border-white"
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
            mode === "Code" ? "bg-green-500 text-black" : mode === "Image" ? "bg-purple-600 text-white" : "bg-black dark:bg-white text-white dark:text-black"
          )}
        >
          Generate Stronger Prompt
        </button>
      </div>
    </motion.div>
  );
};
