import { AppMode } from "../types";

export const modeThemes: Record<
  AppMode,
  {
    label: string;
    description: string;
    accentText: string;
    accentBorder: string;
    accentSoft: string;
    accentStrong: string;
    accentGradient: string;
    accentGlow: string;
    orbPrimary: string;
    orbSecondary: string;
  }
> = {
  Prompt: {
    label: "Prompt",
    description: "Clear, direct prompt generation",
    accentText: "text-violet-500 dark:text-violet-400",
    accentBorder: "border-violet-500/20 dark:border-violet-400/20",
    accentSoft: "bg-violet-500/10 dark:bg-violet-400/10",
    accentStrong: "bg-violet-500 dark:bg-violet-400",
    accentGradient: "bg-gradient-to-r from-violet-500 via-fuchsia-500 to-sky-500",
    accentGlow: "shadow-[0_18px_50px_rgba(139,92,246,0.28)]",
    orbPrimary: "bg-violet-500/10 dark:bg-violet-500/14",
    orbSecondary: "bg-sky-500/10 dark:bg-sky-500/14",
  },
  Image: {
    label: "Image",
    description: "Cinematic image prompt direction",
    accentText: "text-amber-500 dark:text-amber-400",
    accentBorder: "border-amber-500/20 dark:border-amber-400/20",
    accentSoft: "bg-amber-500/10 dark:bg-amber-400/10",
    accentStrong: "bg-amber-500 dark:bg-amber-400",
    accentGradient: "bg-gradient-to-r from-amber-400 via-pink-500 to-rose-500",
    accentGlow: "shadow-[0_18px_50px_rgba(251,191,36,0.28)]",
    orbPrimary: "bg-amber-500/10 dark:bg-amber-500/14",
    orbSecondary: "bg-rose-500/10 dark:bg-rose-500/14",
  },
  Vibe: {
    label: "Vibe Code",
    description: "Terminal-style build prompting",
    accentText: "text-emerald-500 dark:text-emerald-400",
    accentBorder: "border-emerald-500/20 dark:border-emerald-400/20",
    accentSoft: "bg-emerald-500/10 dark:bg-emerald-400/10",
    accentStrong: "bg-emerald-500 dark:bg-emerald-400",
    accentGradient: "bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500",
    accentGlow: "shadow-[0_18px_50px_rgba(16,185,129,0.24)]",
    orbPrimary: "bg-emerald-500/10 dark:bg-emerald-500/14",
    orbSecondary: "bg-cyan-500/10 dark:bg-cyan-500/14",
  },
};
