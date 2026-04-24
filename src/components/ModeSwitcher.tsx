import React from "react";
import { motion } from "motion/react";
import { AppMode } from "../types";
import { Image as ImageIcon, Sparkles, TerminalSquare } from "lucide-react";
import { cn } from "../lib/utils";
import { modeThemes } from "../lib/modeThemes";

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
    id: "Prompt",
    label: "Prompt",
    description: "Everyday prompt generation",
    icon: <Sparkles className="w-4 h-4" />,
  },
  {
    id: "Vibe",
    label: "Vibe Code",
    description: "Terminal-style build prompts",
    icon: <TerminalSquare className="w-4 h-4" />,
  },
  {
    id: "Image",
    label: "Image",
    description: "Visual prompt detail",
    icon: <ImageIcon className="w-4 h-4" />,
  },
];

export const ModeSwitcher: React.FC<ModeSwitcherProps> = ({ mode, onChange }) => {
  return (
    <div className="flex justify-center mb-8 md:mb-12 px-1">
      <div className="w-full max-w-2xl bg-white/60 dark:bg-white/5 backdrop-blur-3xl p-1.5 rounded-[24px] md:rounded-[28px] border border-neutral-200/60 dark:border-white/10 grid grid-cols-3 gap-1.5 shadow-[0_18px_60px_rgba(0,0,0,0.07)] dark:shadow-[0_24px_90px_rgba(0,0,0,0.38)]">
        {modes.map((item) => {
          const isActive = mode === item.id;
          const theme = modeThemes[item.id];

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={cn(
                "group relative min-h-[58px] md:min-h-[66px] px-2.5 sm:px-5 py-2.5 md:py-3 rounded-[20px] text-left transition-all duration-500 overflow-hidden border",
                isActive
                  ? "text-white border-transparent"
                  : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white border-transparent hover:border-neutral-200/70 dark:hover:border-white/10"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="mode-pill"
                  className={cn("absolute inset-0 rounded-[20px] shadow-lg", theme.accentGradient, theme.accentGlow)}
                  transition={{ type: "spring", bounce: 0.18, duration: 0.7 }}
                />
              )}
              {isActive && (
                <motion.div
                  layoutId="mode-glass"
                  className="absolute inset-[1px] rounded-[19px] bg-white/12 dark:bg-white/[0.08]"
                  transition={{ type: "spring", bounce: 0.16, duration: 0.66 }}
                />
              )}
              {!isActive && (
                <div className={cn("absolute inset-x-0 top-0 h-px opacity-0 transition-opacity duration-300 group-hover:opacity-100", theme.accentGradient)} />
              )}
              <div className="absolute inset-x-4 top-0 h-10 rounded-full bg-white/20 dark:bg-white/[0.08] blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <span className="relative z-10 flex items-center gap-2.5">
                <span className={cn(
                  "w-9 h-9 rounded-2xl border flex items-center justify-center transition-colors",
                  isActive
                    ? "bg-white/15 text-white border-white/20"
                    : cn("border-neutral-200 dark:border-white/10", theme.accentText, theme.accentSoft)
                )}>
                  {item.icon}
                </span>
                <span className="min-w-0">
                  <span className="block text-[11px] sm:text-[13px] font-black uppercase tracking-[0.12em] sm:tracking-[0.14em]">
                    {item.label}
                  </span>
                  <span className={cn(
                    "hidden min-[430px]:block text-[10px] font-bold mt-0.5 normal-case tracking-normal",
                    isActive ? "text-white/75" : "text-neutral-400 dark:text-neutral-500"
                  )}>
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
