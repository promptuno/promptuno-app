import React from "react";
import { cn } from "../lib/utils";
import { AppMode } from "../types";

interface LogoProps {
  className?: string;
  mode?: AppMode;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className, mode = "CMD", showText = true }) => {
  const colors =
    mode === "Image"
      ? ["#F59E0B", "#EC4899", "#FB7185"]
      : mode === "Code"
        ? ["#22D3EE", "#3B82F6", "#10B981"]
        : mode === "Vibe"
          ? ["#D946EF", "#EC4899", "#FB923C"]
          : ["#A855F7", "#8B5CF6", "#3B82F6"];

  return (
    <div className={cn("flex items-center gap-2 group shrink-0", className)}>
      <div className="relative w-10 h-10 flex items-center justify-center">
        {/* The Exact Chat Bubble Shape from the Logo */}
        <svg viewBox="0 0 40 40" className="w-full h-full fill-none overflow-visible">
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors[0]} />
              <stop offset="50%" stopColor={colors[1]} />
              <stop offset="100%" stopColor={colors[2]} />
            </linearGradient>
          </defs>
          
          {/* Main Bubble */}
          <path 
            d="M8,4 L32,4 C36.4,4 40,7.6 40,12 L40,24 C40,28.4 36.4,32 32,32 L24,32 L18,38 L16,32 L8,32 C3.6,32 0,28.4 0,24 L0,12 C0,7.6 3.6,4 8,4 Z" 
            className="fill-none stroke-[2.5] transition-all duration-500"
            stroke="url(#logoGradient)"
          />
          
          {/* Internal Star */}
          <path 
            d="M26,12 L27.5,15.5 L31,17 L27.5,18.5 L26,22 L24.5,18.5 L21,17 L24.5,15.5 Z" 
            style={{ fill: colors[1] }}
            className="animate-pulse"
          />
          
          {/* Accent dot */}
          <circle cx="34" cy="10" r="2.5" style={{ fill: colors[2] }} />
        </svg>
      </div>
      
      {showText && (
        <span className={cn(
          "font-extrabold text-xl md:text-2xl tracking-tighter transition-all duration-300",
          "text-[#1A1C2C] dark:text-white"
        )}>
          Promptuno
        </span>
      )}
    </div>
  );
};
