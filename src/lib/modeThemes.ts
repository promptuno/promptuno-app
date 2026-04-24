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
  CMD: {
    label: "CMD",
    description: "Core prompt setup",
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
    description: "Visual prompt detail",
    accentText: "text-amber-500 dark:text-amber-400",
    accentBorder: "border-amber-500/20 dark:border-amber-400/20",
    accentSoft: "bg-amber-500/10 dark:bg-amber-400/10",
    accentStrong: "bg-amber-500 dark:bg-amber-400",
    accentGradient: "bg-gradient-to-r from-amber-400 via-pink-500 to-rose-500",
    accentGlow: "shadow-[0_18px_50px_rgba(251,191,36,0.28)]",
    orbPrimary: "bg-amber-500/10 dark:bg-amber-500/14",
    orbSecondary: "bg-rose-500/10 dark:bg-rose-500/14",
  },
  Code: {
    label: "Code",
    description: "Developer-ready prompts",
    accentText: "text-cyan-500 dark:text-cyan-400",
    accentBorder: "border-cyan-500/20 dark:border-cyan-400/20",
    accentSoft: "bg-cyan-500/10 dark:bg-cyan-400/10",
    accentStrong: "bg-cyan-500 dark:bg-cyan-400",
    accentGradient: "bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-500",
    accentGlow: "shadow-[0_18px_50px_rgba(34,211,238,0.24)]",
    orbPrimary: "bg-cyan-500/10 dark:bg-cyan-500/14",
    orbSecondary: "bg-emerald-500/10 dark:bg-emerald-500/14",
  },
  Vibe: {
    label: "Vibe",
    description: "Tone, style, and feel",
    accentText: "text-fuchsia-500 dark:text-fuchsia-400",
    accentBorder: "border-fuchsia-500/20 dark:border-fuchsia-400/20",
    accentSoft: "bg-fuchsia-500/10 dark:bg-fuchsia-400/10",
    accentStrong: "bg-fuchsia-500 dark:bg-fuchsia-400",
    accentGradient: "bg-gradient-to-r from-fuchsia-500 via-pink-500 to-orange-400",
    accentGlow: "shadow-[0_18px_50px_rgba(217,70,239,0.24)]",
    orbPrimary: "bg-fuchsia-500/10 dark:bg-fuchsia-500/14",
    orbSecondary: "bg-orange-400/10 dark:bg-orange-400/14",
  },
};
