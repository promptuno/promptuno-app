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
    <div className="flex justify-center mb-12">
      <div className="bg-neutral-100/50 dark:bg-white/5 backdrop-blur-3xl p-1.5 rounded-[24px] border border-neutral-200/50 dark:border-white/10 flex items-center gap-1 shadow-2xl">
        <button
          onClick={() => onChange("Forge")}
          className={`relative px-4 sm:px-7 py-3 rounded-2xl text-[11px] sm:text-[12px] font-black tracking-widest uppercase transition-all duration-300 flex items-center gap-2 ${
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
          <span className="relative z-10 flex items-center gap-2.5">
            <Sparkles className="w-4 h-4" />
            Forge
          </span>
        </button>

        <button
          onClick={() => onChange("Code")}
          className={`relative px-4 sm:px-7 py-3 rounded-2xl text-[11px] sm:text-[12px] font-black tracking-widest uppercase transition-all duration-300 flex items-center gap-2 ${
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
          <span className="relative z-10 flex items-center gap-2.5">
            <Terminal className="w-4 h-4" />
            Vibe Coding
          </span>
        </button>

        <button
          onClick={() => onChange("Image")}
          className={`relative px-4 sm:px-7 py-3 rounded-2xl text-[11px] sm:text-[12px] font-black tracking-widest uppercase transition-all duration-300 flex items-center gap-2 ${
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
          <span className="relative z-10 flex items-center gap-2.5">
            <Palette className="w-4 h-4" />
            Image Art
          </span>
        </button>
      </div>
    </div>
  );
};
