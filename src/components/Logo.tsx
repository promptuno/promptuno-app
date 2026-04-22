import React from "react";
import { Sparkles } from "lucide-react";
import { cn } from "../lib/utils";

interface LogoProps {
  className?: string;
  mode?: "Forge" | "Code" | "Image";
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className, mode = "Forge", showText = true }) => {
  return (
    <div className={cn("flex items-center gap-2 group shrink-0", className)}>
      <div className="relative w-10 h-10 flex items-center justify-center">
        {/* The Exact Chat Bubble Shape from the Logo */}
        <svg viewBox="0 0 40 40" className="w-full h-full fill-none overflow-visible">
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A855F7" />
              <stop offset="50%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#3B82F6" />
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
            className="fill-purple-500 animate-pulse"
          />
          
          {/* Accent dot */}
          <circle cx="34" cy="10" r="2.5" className="fill-pink-500" />
        </svg>
      </div>
      
      {showText && (
        <span className={cn(
          "font-extrabold text-xl md:text-2xl tracking-tighter transition-all duration-300",
          mode === "Code" ? "text-green-500" : "text-[#1A1C2C] dark:text-white"
        )}>
          Promptuno
        </span>
      )}
    </div>
  );
};
