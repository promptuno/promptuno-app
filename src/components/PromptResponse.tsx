import React, { useState } from "react";
import { Check, ChevronRight, Copy, RotateCcw, Scissors, Sparkles, Wand2, Zap } from "lucide-react";
import { AppMode, GeneratedPrompt, Language, Platform, RefinementType } from "../types";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { Typewriter } from "./Typewriter";
import { translations } from "../lib/translations";

interface PromptResponseProps {
  request: string;
  platform: Platform;
  response: GeneratedPrompt;
  onRegenerate: () => void;
  onRefine: (type: RefinementType) => void;
  mode: AppMode;
  lang: Language;
}

export const PromptResponse: React.FC<PromptResponseProps> = ({
  request,
  platform,
  response,
  onRegenerate,
  onRefine,
  mode,
  lang,
}) => {
  const t = translations[lang];
  const [copied, setCopied] = useState(false);
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const isWriteMode = mode === "Write";

  const handleCopy = () => {
    navigator.clipboard.writeText(response.engineeredPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const responseLabel = isWriteMode ? "Writing Ready" : "Prompt Ready";
  const goalLabel = isWriteMode ? "Writing Strategy" : "Prompt Strategy";
  const outputLabel = isWriteMode ? "Polished Output" : "Engineered Prompt";
  const reasoningLabel = isWriteMode ? "Editorial Reasoning" : "Prompt Architecture";

  const refinementActions: Array<{ type: RefinementType; label: string; icon: React.ReactNode }> = isWriteMode
    ? [
        { type: "concise", label: "Shorten", icon: <Scissors className="w-4 h-4 transition-transform group-hover:scale-110" /> },
        { type: "technician", label: "Sharpen", icon: <Zap className="w-4 h-4 transition-transform group-hover:scale-110 group-hover:text-amber-500" /> },
        { type: "corporate", label: "Formalize", icon: <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" /> },
        { type: "creative", label: "Friendlier", icon: <Sparkles className="w-4 h-4 transition-transform group-hover:scale-110" /> },
      ]
    : [
        { type: "concise", label: t.refinements.Concise, icon: <Scissors className="w-4 h-4 transition-transform group-hover:scale-110" /> },
        { type: "technician", label: t.refinements.Technician, icon: <Zap className="w-4 h-4 transition-transform group-hover:scale-110 group-hover:text-amber-500" /> },
        { type: "corporate", label: "More Corporate", icon: <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" /> },
        { type: "creative", label: "More Creative", icon: <Sparkles className="w-4 h-4 transition-transform group-hover:scale-110" /> },
        { type: "adapt", label: t.refinements.Adapt, icon: <RotateCcw className="w-4 h-4 transition-transform group-hover:rotate-180 duration-500" /> },
      ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto py-4 md:py-10 px-0 md:px-4 flex flex-col gap-6 md:gap-10"
    >
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex gap-3 md:gap-5 px-4 md:px-2"
      >
        <div className="w-8 h-8 rounded-full flex-shrink-0 animate-pulse bg-neutral-200 dark:bg-neutral-800" />
        <div className="pt-1.5 flex-1 text-left">
          <p className="text-[14px] font-medium italic text-neutral-600 dark:text-neutral-400">"{request}"</p>
        </div>
      </motion.div>

      <div className="flex gap-3 md:gap-5">
        <div className="w-8 h-8 rounded-full items-center justify-center flex-shrink-0 shadow-lg ring-4 hidden sm:flex bg-black dark:bg-white ring-black/5 dark:ring-white/5">
          {isWriteMode ? (
            <Wand2 className="w-4 h-4 text-white dark:text-black" />
          ) : (
            <div className="w-3 h-3 border-2 border-white dark:border-black rotate-45" />
          )}
        </div>

        <div className="flex-1 backdrop-blur-3xl border rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden bg-white/50 dark:bg-[#080808]/50 border-neutral-200 dark:border-white/10">
          <div className="p-4 md:p-8 space-y-4 md:space-y-6 text-left">
            <div className="flex items-center justify-between border-b pb-4 md:pb-5 border-neutral-50 dark:border-white/5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-spin-slow text-amber-500" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500">
                  {responseLabel}
                </span>
              </div>
              <button
                onClick={handleCopy}
                className={cn(
                  "px-4 py-1.5 rounded-xl text-[12px] font-bold transition-all flex items-center gap-2 border",
                  copied
                    ? "bg-green-500/10 text-green-500 border-green-500/20"
                    : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-white/10 hover:border-black dark:hover:border-white"
                )}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            <div className="text-[14px] md:text-[15px] leading-relaxed font-medium p-4 md:p-6 rounded-xl md:rounded-2xl border shadow-inner relative overflow-hidden group bg-neutral-50 dark:bg-white/[0.02] text-neutral-800 dark:text-neutral-100 border-neutral-100 dark:border-white/5">
              <span className="font-black text-[11px] uppercase tracking-widest block mb-4 border-b pb-1 w-fit text-indigo-500 dark:text-indigo-400 border-indigo-500/10">
                {goalLabel}
              </span>
              <p className="mb-8 opacity-80 leading-relaxed">
                <Typewriter text={response.goal} speed={15} />
              </p>

              <span className="font-black text-[11px] uppercase tracking-widest block mb-3 border-b pb-1 w-fit text-indigo-500 dark:text-indigo-400 border-indigo-500/10">
                {outputLabel}
              </span>
              <div className="whitespace-pre-wrap leading-relaxed selection:bg-indigo-500/20">
                <Typewriter
                  text={response.engineeredPrompt}
                  speed={8}
                  delay={1000}
                  onComplete={() => setIsTypingComplete(true)}
                />
              </div>
            </div>

            <AnimatePresence>
              {isTypingComplete && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 rounded-2xl border transition-all bg-indigo-500/5 border-indigo-500/20 hover:bg-indigo-500/[0.07]"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] block text-indigo-500">
                      {reasoningLabel}
                    </span>
                  </div>
                  <p className="text-[13px] leading-relaxed italic font-medium text-neutral-500 dark:text-neutral-400">
                    <Typewriter text={response.explanation} speed={5} delay={500} />
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {isTypingComplete && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-wrap gap-3 pt-4"
                >
                  <button
                    onClick={onRegenerate}
                    className="group px-6 py-3 rounded-xl text-[12px] font-black uppercase tracking-[0.15em] transition-all hover:scale-105 active:scale-95 flex items-center gap-2 shadow-xl bg-black dark:bg-white text-white dark:text-black"
                  >
                    <RotateCcw className="w-4 h-4 transition-transform group-hover:rotate-180 duration-500" />
                    {isWriteMode ? "Rewrite" : t.refinements.Reforge}
                  </button>
                  {refinementActions.map((action) => (
                    <button
                      key={action.type}
                      onClick={() => onRefine(action.type)}
                      className="group px-4 md:px-5 py-3 border rounded-xl text-[11px] md:text-[12px] font-black uppercase tracking-[0.12em] md:tracking-[0.15em] transition-all flex items-center gap-2 shadow-sm bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-white/10 hover:border-black dark:hover:border-white"
                    >
                      {action.icon}
                      {action.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
