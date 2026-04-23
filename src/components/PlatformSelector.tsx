import React from "react";
import { Platform } from "../types";
import { PLATFORMS } from "../constants";
import { cn } from "../lib/utils";
import { motion } from "motion/react";
import { PRIMARY_MODEL_LIMIT } from "../lib/productLayers";

interface PlatformSelectorProps {
  selected: Platform;
  onSelect: (platform: Platform) => void;
}

export const PlatformSelector: React.FC<PlatformSelectorProps> = ({
  selected,
  onSelect,
}) => {
  return (
    <div className="flex flex-wrap items-center bg-neutral-100/50 dark:bg-neutral-800/10 p-1 rounded-full border border-neutral-200/50 dark:border-neutral-800 gap-0">
      {PLATFORMS.slice(0, PRIMARY_MODEL_LIMIT).map((platform) => (
        <button
          key={platform}
          onClick={() => onSelect(platform)}
          className={cn(
            "relative px-4 py-1.5 text-xs font-medium rounded-full transition-all duration-200 whitespace-nowrap",
            selected === platform
              ? "text-neutral-900 dark:text-neutral-100"
              : "text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300"
          )}
        >
          {selected === platform && (
            <motion.div
              layoutId="active-pill"
              className="absolute inset-0 bg-white dark:bg-neutral-800 shadow-sm rounded-full"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative z-10">{platform}</span>
        </button>
      ))}
    </div>
  );
};
