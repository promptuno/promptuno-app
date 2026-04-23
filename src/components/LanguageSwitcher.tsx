import React, { useState } from "react";
import { Language, AppMode } from "../types";
import { cn } from "../lib/utils";
import { Globe } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface LanguageSwitcherProps {
  current: Language;
  onSelect: (lang: Language) => void;
  mode: AppMode;
}

const languages: { code: Language; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "EN" },
  { code: "fr", label: "Francais", flag: "FR" },
  { code: "ar", label: "Arabic", flag: "AR" },
  { code: "tr", label: "Turkish", flag: "TR" },
  { code: "ru", label: "Russian", flag: "RU" },
];

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ current, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onClick={() => setIsOpen(!isOpen)}
    >
      <button className="p-2 rounded-xl transition-all duration-300 backdrop-blur-md flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100">
        <Globe className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 10, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 p-1.5 rounded-2xl border shadow-2xl backdrop-blur-3xl flex flex-col gap-0.5 min-w-[140px] z-[100] bg-white/90 dark:bg-black/90 border-neutral-100 dark:border-white/10"
          >
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  onSelect(lang.code);
                  setIsOpen(false);
                }}
                className={cn(
                  "flex items-center justify-between w-full px-3 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all",
                  current === lang.code
                    ? "bg-black dark:bg-white text-white dark:text-black"
                    : "text-neutral-400 hover:bg-neutral-50 dark:hover:bg-white/5 hover:text-neutral-900 dark:hover:text-white dark:text-neutral-500"
                )}
              >
                <span>{lang.label}</span>
                <span className="text-[10px]">{lang.flag}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
