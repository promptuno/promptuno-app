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
    description: "Prompt generator",
    icon: <Sparkles className="w-4 h-4" />,
  },
  {
    id: "Vibe",
    label: "Vibe Code",
    description: "Coding prompt",
    icon: <TerminalSquare className="w-4 h-4" />,
  },
  {
    id: "Image",
    label: "Image",
    description: "Image prompt",
    icon: <ImageIcon className="w-4 h-4" />,
  },
];

export const ModeSwitcher: React.FC<ModeSwitcherProps> = ({ mode, onChange }) => {
  return (
    <div className="flex justify-center mb-6 md:mb-10 px-1">
      <div className="w-full max-w-xl bg-white/70 dark:bg-white/5 backdrop-blur-3xl p-1.5 rounded-[22px] border border-neutral-200/60 dark:border-white/10 grid grid-cols-3 gap-1.5 shadow-[0_16px_44px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_70px_rgba(0,0,0,0.3)]">
        {modes.map((item) => {
          const isActive = mode === item.id;
          const theme = modeThemes[item.id];

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={cn(
                "group relative min-h-[56px] px-2.5 sm:px-4 py-2.5 rounded-[18px] text-left transition-all duration-500 overflow-hidden border",
                isActive
                  ? "text-white border-transparent"
                  : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white border-transparent hover:border-neutral-200/70 dark:hover:border-white/10"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="mode-pill"
                  className={cn("absolute inset-0 rounded-[18px] shadow-lg", theme.accentGradient, theme.accentGlow)}
                  transition={{ type: "spring", bounce: 0.18, duration: 0.7 }}
                />
              )}
              {isActive && (
                <motion.div
                  layoutId="mode-glass"
                  className="absolute inset-[1px] rounded-[17px] bg-white/12 dark:bg-white/[0.08]"
                  transition={{ type: "spring", bounce: 0.16, duration: 0.66 }}
                />
              )}
              {!isActive && (
                <div className={cn("absolute inset-x-0 top-0 h-px opacity-0 transition-opacity duration-300 group-hover:opacity-100", theme.accentGradient)} />
              )}
              <div className="absolute inset-x-4 top-0 h-8 rounded-full bg-white/20 dark:bg-white/[0.08] blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <span className="relative z-10 flex items-center gap-2.5">
                <span className={cn(
                  "w-8 h-8 rounded-2xl border flex items-center justify-center transition-colors",
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
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
