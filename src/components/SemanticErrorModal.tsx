import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertCircle, X, ArrowRight } from "lucide-react";
import { AppMode } from "../types";
import { modeThemes } from "../lib/modeThemes";
import { cn } from "../lib/utils";

interface SemanticErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  mode: AppMode;
}

export const SemanticErrorModal: React.FC<SemanticErrorModalProps> = ({
  isOpen,
  onClose,
  message,
  mode,
}) => {
  const theme = modeThemes[mode];
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg p-8 rounded-[32px] border shadow-2xl overflow-hidden bg-white dark:bg-neutral-900 border-neutral-100 dark:border-white/5"
          >
            <div className={cn("absolute top-0 right-0 w-32 h-32 blur-[80px] -z-10 opacity-30", theme.orbPrimary)} />

            <div className="flex items-start justify-between mb-8">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg bg-red-50 dark:bg-red-500/10 text-red-500">
                <AlertCircle className="w-6 h-6" />
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-neutral-100 dark:hover:bg-white/5 rounded-full transition-colors"
                id="close-error-modal"
              >
                <X className="w-5 h-5 text-neutral-400" />
              </button>
            </div>

            <h3 className="text-xl font-black uppercase tracking-tight mb-4 text-neutral-900 dark:text-white">
              Ambiguous Intent Detected
            </h3>

            <div className="text-sm leading-relaxed mb-8 text-neutral-500 dark:text-neutral-400">
              {message}
            </div>

            <button
              onClick={onClose}
              className={cn("w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[12px] flex items-center justify-center gap-2 group transition-all text-white hover:scale-[1.02] active:scale-[0.98]", theme.accentGradient)}
            >
              I Understand
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
