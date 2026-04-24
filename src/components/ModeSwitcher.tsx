import React from "react";
import { motion } from "motion/react";
import { AppMode } from "../types";
import { Braces, Image as ImageIcon, Palette, TerminalSquare } from "lucide-react";
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
    id: "CMD",
    label: "CMD",
    description: "Core prompt setup",
    icon: <TerminalSquare className="w-4 h-4" />,
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
          const theme = modeThemes[item.id];

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={cn(
                "group relative min-h-[68px] px-3 sm:px-5 py-3 rounded-[20px] text-left transition-all duration-300 overflow-hidden border",
                isActive
                  ? "text-white border-transparent"
                  : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white border-transparent hover:border-neutral-200/70 dark:hover:border-white/10"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="mode-pill"
                  className={cn("absolute inset-0 rounded-[20px] shadow-lg", theme.accentGradient, theme.accentGlow)}
                  transition={{ type: "spring", bounce: 0.16, duration: 0.58 }}
                />
              )}
              {!isActive && (
                <div className={cn("absolute inset-x-0 top-0 h-px opacity-0 transition-opacity duration-300 group-hover:opacity-100", theme.accentGradient)} />
              )}
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
                  <span className="block text-[12px] sm:text-[13px] font-black uppercase tracking-[0.14em]">
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
