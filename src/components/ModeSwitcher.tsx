import React from "react";
import { motion } from "motion/react";
import { AppMode } from "../types";
import { Sparkles, Terminal, Palette } from "lucide-react";

interface ModeSwitcherProps {
  mode: AppMode;
  onChange: (mode: AppMode) => void;
}

export const ModeSwitcher: React.FC<ModeSwitcherProps> = ({ mode, onChange }) => {
  return (
    <div className="flex justify-center mb-8 md:mb-12 px-1">
      <div className="w-full max-w-xl bg-neutral-100/50 dark:bg-white/5 backdrop-blur-3xl p-1 rounded-[20px] md:rounded-[24px] border border-neutral-200/50 dark:border-white/10 grid grid-cols-3 gap-1 shadow-2xl">
        <button
          onClick={() => onChange("Forge")}
          className={`relative px-2 sm:px-7 py-3 rounded-2xl text-[10px] sm:text-[12px] font-black tracking-[0.08em] sm:tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 ${
            mode === "Forge" 
              ? "text-black dark:text-white" 
              : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
          }`}
        >
          {mode === "Forge" && (
            <motion.div
              layoutId="mode-pill"
              className="absolute inset-0 bg-white dark:bg-neutral-800 rounded-2xl shadow-lg border border-neutral-100 dark:border-white/5"
              transition={{ type: "spring", bounce: 0.15, duration: 0.6 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-1.5 sm:gap-2.5 whitespace-nowrap">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Forge
          </span>
        </button>

        <button
          onClick={() => onChange("Code")}
          className={`relative px-2 sm:px-7 py-3 rounded-2xl text-[10px] sm:text-[12px] font-black tracking-[0.08em] sm:tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 ${
            mode === "Code" 
              ? "text-green-600 dark:text-green-400" 
              : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
          }`}
        >
          {mode === "Code" && (
            <motion.div
              layoutId="mode-pill"
              className="absolute inset-0 bg-white dark:bg-neutral-800 rounded-2xl shadow-lg border border-neutral-100 dark:border-white/5"
              transition={{ type: "spring", bounce: 0.15, duration: 0.6 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-1.5 sm:gap-2.5 whitespace-nowrap">
            <Terminal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden min-[390px]:inline">Vibe</span> Code
          </span>
        </button>

        <button
          onClick={() => onChange("Image")}
          className={`relative px-2 sm:px-7 py-3 rounded-2xl text-[10px] sm:text-[12px] font-black tracking-[0.08em] sm:tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 ${
            mode === "Image" 
              ? "text-purple-600 dark:text-purple-400" 
              : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
          }`}
        >
          {mode === "Image" && (
            <motion.div
              layoutId="mode-pill"
              className="absolute inset-0 bg-white dark:bg-neutral-800 rounded-2xl shadow-lg border border-neutral-100 dark:border-white/5"
              transition={{ type: "spring", bounce: 0.15, duration: 0.6 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-1.5 sm:gap-2.5 whitespace-nowrap">
            <Palette className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Image
          </span>
        </button>
      </div>
    </div>
  );
};
