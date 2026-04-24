import React from "react";
import { motion } from "motion/react";
import { AppMode } from "../types";
import { Braces, Image as ImageIcon, Palette, Sparkles } from "lucide-react";
import { cn } from "../lib/utils";

interface ModeSwitcherProps {
  mode: AppMode;
  onChange: (mode: AppMode) => void;
}

const modes: Array<{
  id: AppMode;
  label: string;
  description: string;
  icon: React.ReactNode;
}> = [
  {
    id: "General",
    label: "General",
    description: "Everyday prompt engineering",
    icon: <Sparkles className="w-4 h-4" />,
  },
  {
    id: "Image",
    label: "Image",
    description: "Visual prompt detail",
    icon: <ImageIcon className="w-4 h-4" />,
  },
  {
    id: "Code",
    label: "Code",
    description: "Developer-ready prompts",
    icon: <Braces className="w-4 h-4" />,
  },
  {
    id: "Vibe",
    label: "Vibe",
    description: "Tone, style, and feel",
    icon: <Palette className="w-4 h-4" />,
  },
];

export const ModeSwitcher: React.FC<ModeSwitcherProps> = ({ mode, onChange }) => {
  return (
    <div className="flex justify-center mb-8 md:mb-12 px-1">
      <div className="w-full max-w-3xl bg-neutral-100/55 dark:bg-white/5 backdrop-blur-3xl p-1.5 rounded-[24px] md:rounded-[28px] border border-neutral-200/50 dark:border-white/10 grid grid-cols-2 md:grid-cols-4 gap-1.5 shadow-2xl">
        {modes.map((item) => {
          const isActive = mode === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={cn(
                "relative min-h-[58px] px-3 sm:px-6 py-3 rounded-[20px] text-left transition-all duration-300 overflow-hidden",
                isActive ? "text-black dark:text-white" : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="mode-pill"
                  className="absolute inset-0 bg-white dark:bg-neutral-800 rounded-[20px] shadow-lg border border-neutral-100 dark:border-white/5"
                  transition={{ type: "spring", bounce: 0.16, duration: 0.58 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2.5">
                <span className={cn(
                  "w-8 h-8 rounded-2xl border flex items-center justify-center transition-colors",
                  isActive
                    ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                    : "border-neutral-200 dark:border-white/10"
                )}>
                  {item.icon}
                </span>
                <span className="min-w-0">
                  <span className="block text-[12px] sm:text-[13px] font-black uppercase tracking-[0.14em]">
                    {item.label}
                  </span>
                  <span className="hidden min-[430px]:block text-[10px] font-bold mt-0.5 text-neutral-400 dark:text-neutral-500 normal-case tracking-normal">
                    {item.description}
                  </span>
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
