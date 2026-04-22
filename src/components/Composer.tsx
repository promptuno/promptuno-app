import React, { useRef, useEffect, useState } from "react";
import { ArrowUp, Mic, MicOff, Image as ImageIcon, Rocket } from "lucide-react";
import { cn } from "../lib/utils";
import { AppMode, Platform } from "../types";
import { PLATFORMS, CODE_PLATFORMS, IMAGE_PLATFORMS } from "../constants";
import { motion, AnimatePresence } from "motion/react";
import { Zap, Palette } from "lucide-react";
import { Language } from "../types";
import { translations } from "../lib/translations";

interface ComposerProps {
  value: string;
  onChange: (value: any) => void;
  onSend: () => void;
  disabled?: boolean;
  isGenerating?: boolean;
  platform: Platform;
  onPlatformChange: (platform: Platform) => void;
  mode: AppMode;
  isLimitReached?: boolean;
  onUpgrade?: () => void;
  lang: Language;
}

export const Composer: React.FC<ComposerProps> = ({
  value,
  onChange,
  onSend,
  disabled,
  isGenerating,
  platform,
  onPlatformChange,
  mode,
  isLimitReached,
  onUpgrade,
  lang,
}) => {
  const t = translations[lang];
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isListening, setIsListening] = useState(false);
  const [isAttached, setIsAttached] = useState(false);
  const [isLimitDismissed, setIsLimitDismissed] = useState(false);
  const [placeholderText, setPlaceholderText] = useState("");
  const recognitionRef = useRef<any>(null);

  const currentPlatforms = mode === "Code" 
    ? CODE_PLATFORMS 
    : (mode === "Image" ? IMAGE_PLATFORMS : PLATFORMS);
  const createForLabel = lang === "en"
    ? mode === "Code"
      ? "Create an architecture for"
      : mode === "Image"
        ? "Create an image prompt for"
        : "Create a prompt for"
    : t.labels.CreateFor.replace('{type}', mode === "Code" ? t.labels.Architecture : (mode === "Image" ? t.labels.ArtVibe : t.labels.Prompt));

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  useEffect(() => {
    textareaRef.current?.focus({ preventScroll: true });
  }, [mode, platform]);

  useEffect(() => {
    const examples =
      mode === "Code"
        ? [
            "Build a SaaS dashboard with auth, Stripe, and clean database models...",
            "Refactor this app into a faster, mobile-first product...",
            "Create an agent prompt that edits files safely and runs tests...",
          ]
        : mode === "Image"
          ? [
              "Create a cinematic image prompt for a luxury perfume campaign...",
              "Turn my product idea into a Midjourney-ready visual prompt...",
              "Describe a realistic hero image with lighting, lens, and composition...",
            ]
          : [
              `Write a stronger prompt for ${platform} to launch my startup...`,
              `Turn my rough idea into a detailed ${platform} prompt...`,
              "Create a prompt that gives step-by-step, premium answers...",
            ];

    let exampleIndex = 0;
    let charIndex = 0;
    let deleting = false;
    let timeout: number;

    const tick = () => {
      const sample = examples[exampleIndex];
      setPlaceholderText(sample.slice(0, charIndex));

      if (!deleting && charIndex < sample.length) {
        charIndex += 1;
        timeout = window.setTimeout(tick, 34);
        return;
      }

      if (!deleting && charIndex === sample.length) {
        deleting = true;
        timeout = window.setTimeout(tick, 1400);
        return;
      }

      if (deleting && charIndex > 0) {
        charIndex -= 1;
        timeout = window.setTimeout(tick, 16);
        return;
      }

      deleting = false;
      exampleIndex = (exampleIndex + 1) % examples.length;
      timeout = window.setTimeout(tick, 250);
    };

    tick();
    return () => window.clearTimeout(timeout);
  }, [mode, platform]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition && !recognitionRef.current) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          onChange((prev: string) => prev + (prev ? " " : "") + finalTranscript);
        }
      };

      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, [onChange]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.error("Speech recognition error:", e);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsAttached(true);
    }
  };

  return (
    <form 
      onSubmit={(e) => { e.preventDefault(); onSend(); }}
      className="w-full max-w-3xl mx-auto"
    >
      <div className={cn(
        "relative flex flex-col p-5 md:p-8 backdrop-blur-3xl border transition-all duration-500 overflow-hidden",
        mode === "Code" 
          ? "bg-black/90 border-green-500/30 rounded-xl shadow-[0_0_50px_rgba(34,197,94,0.1)] font-mono" 
          : (mode === "Image" 
              ? "bg-white/70 dark:bg-black/70 border-purple-500/20 rounded-[32px] md:rounded-[40px] shadow-[0_40px_120px_rgba(168,85,247,0.1)]"
              : "bg-white/70 dark:bg-[#080808]/70 border-neutral-200 dark:border-white/10 rounded-[32px] md:rounded-[40px] shadow-[0_30px_70px_rgba(0,0,0,0.04)] dark:shadow-[0_40px_120px_rgba(0,0,0,0.8)]"),
        disabled && "opacity-80 grayscale-[0.5]",
        isListening && "ring-2 ring-indigo-500/20"
      )}>
        {/* Decorative Elements for Image Mode */}
        {mode === "Image" && (
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-indigo-500/10 blur-3xl -z-10" />
        )}

        {/* Terminal Effect Header for Code Mode */}
        {mode === "Code" && (
          <div className="absolute top-0 left-0 w-full h-8 bg-neutral-900 border-b border-green-500/20 flex items-center px-4 gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
            <div className="ml-4 text-[10px] text-green-500/50 uppercase tracking-[0.2em] font-black">Promptuno Terminal — v3.1.0</div>
          </div>
        )}

        {/* Limit Overlay */}
        {isLimitReached && !isLimitDismissed && (
          <div className="absolute inset-0 z-50 backdrop-blur-xl bg-white/10 dark:bg-black/10 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
            <div className="bg-white dark:bg-neutral-900 p-8 rounded-[32px] shadow-2xl border border-neutral-100 dark:border-white/10 max-w-sm">
              <Zap className="w-10 h-10 text-indigo-500 mx-auto mb-4" />
              <h3 className="text-xl font-black uppercase tracking-tight mb-2">{t.labels.LimitReached}</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">{t.labels.LimitDescription}</p>
              
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={onUpgrade}
                  className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-black uppercase tracking-widest text-[12px] hover:scale-105 active:scale-95 transition-all shadow-xl"
                >
                  {t.buttons.Upgrade}
                </button>
                <button
                  type="button"
                  onClick={() => setIsLimitDismissed(true)}
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors py-2"
                >
                  {t.buttons.MaybeLater}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Access Restriction based on Limit */}
        {isLimitReached && isLimitDismissed && (
          <div className="absolute inset-0 z-50 backdrop-blur-md bg-white/5 dark:bg-black/5 flex items-center justify-center pointer-events-none">
            <div className="pointer-events-auto mt-20">
              <button 
                type="button"
                onClick={onUpgrade}
                className="px-6 py-2 bg-indigo-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-colors shadow-lg"
              >
                {t.buttons.Unlock}
              </button>
            </div>
          </div>
        )}

        <div className={cn("flex flex-col gap-3 mb-5 md:mb-6", mode === "Code" && "mt-4")}>
          <span className={cn(
            "text-[11px] md:text-[14px] font-black uppercase tracking-[0.16em] md:tracking-[0.2em] text-center sm:text-left",
            mode === "Code" ? "text-green-500/50" : (mode === "Image" ? "text-purple-400" : "text-neutral-400 dark:text-neutral-600")
          )}>
            {createForLabel}
          </span>
          <div className={cn(
            "flex items-center gap-1 p-1 rounded-2xl border overflow-x-auto no-scrollbar w-full snap-x",
            mode === "Code" ? "bg-green-500/5 border-green-500/20" : (mode === "Image" ? "bg-purple-500/5 border-purple-500/20" : "bg-neutral-100/50 dark:bg-white/5 border-neutral-200/50 dark:border-white/5")
          )}>
            {currentPlatforms.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => onPlatformChange(p as Platform)}
                className={cn(
                  "relative shrink-0 snap-center px-4 py-2 text-[11px] font-bold rounded-xl transition-all duration-300",
                  platform === p
                    ? (mode === "Code" ? "text-green-400" : (mode === "Image" ? "text-purple-600 dark:text-purple-300" : "text-black dark:text-white"))
                    : (mode === "Code" ? "text-green-900/50 hover:text-green-700" : (mode === "Image" ? "text-purple-900/40 hover:text-purple-600" : "text-neutral-400 hover:text-neutral-600 dark:text-neutral-600 dark:hover:text-neutral-400"))
                )}
              >
                {platform === p && (
                  <motion.div
                    layoutId="platform-pill"
                    className={cn(
                      "absolute inset-0 shadow-sm rounded-xl -z-0 border",
                      mode === "Code" ? "bg-green-500/10 border-green-500/30" : (mode === "Image" ? "bg-purple-500/10 border-purple-500/30" : "bg-white dark:bg-neutral-800 border-neutral-100 dark:border-white/10")
                    )}
                    transition={{ type: "spring", bounce: 0.1, duration: 0.5 }}
                  />
                )}
                <span className="relative z-10">{p}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-start gap-3 md:gap-4">
          {mode === "Code" && <span className="text-green-500 mt-1">{">"}</span>}
          {mode === "Image" && <Palette className="w-6 h-6 text-purple-500 mt-1" />}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholderText || (
              mode === "Code" 
                ? t.placeholders.Code 
                : (mode === "Image" ? t.placeholders.Image : t.placeholders.Forge.replace('{platform}', platform))
            )}
            className={cn(
              "flex-1 bg-transparent border-none focus:ring-0 resize-none text-[17px] md:text-[22px] font-medium leading-relaxed p-0 min-h-[150px] md:min-h-[140px] max-h-[500px]",
              mode === "Code" 
                ? "text-green-400 placeholder-green-900 font-mono" 
                : (mode === "Image" 
                    ? "text-purple-900 dark:text-purple-100 placeholder-purple-200 dark:placeholder-purple-900"
                    : "text-neutral-900 dark:text-white placeholder-neutral-200 dark:placeholder-neutral-800")
            )}
            disabled={disabled || isLimitReached}
          />
        </div>

        {isAttached && (
          <div className={cn(
            "mt-4 flex items-center gap-2 p-3 rounded-2xl w-fit border",
            mode === "Code" ? "bg-green-500/5 border-green-500/20" : (mode === "Image" ? "bg-purple-500/5 border-purple-500/20" : "bg-indigo-50/50 dark:bg-indigo-500/10 border-indigo-100/50 dark:border-indigo-500/20")
          )}>
            <ImageIcon className={cn("w-4 h-4", mode === "Code" ? "text-green-500" : (mode === "Image" ? "text-purple-500" : "text-indigo-500"))} />
            <span className={cn("text-[10px] font-bold uppercase tracking-widest leading-none", mode === "Code" ? "text-green-500" : (mode === "Image" ? "text-purple-600" : "text-indigo-600 dark:text-indigo-400"))}>
              {lang === 'fr' ? 'Image de Contexte Chargée' : (lang === 'ar' ? 'تم تحميل صورة السياق' : (lang === 'tr' ? 'Bağlam Resmi Yüklendi' : (lang === 'ru' ? 'Контекстное изображение загружено' : 'Context Image Loaded')))}
            </span>
            <button type="button" onClick={() => setIsAttached(false)} className={cn("ml-2", mode === "Code" ? "text-green-700" : (mode === "Image" ? "text-purple-700" : "text-indigo-400 hover:text-indigo-600"))}>×</button>
          </div>
        )}

        <div className={cn(
          "flex flex-col sm:flex-row items-stretch sm:items-center justify-between mt-6 md:mt-8 pt-4 md:pt-6 border-t gap-4",
          mode === "Code" ? "border-green-500/20" : (mode === "Image" ? "border-purple-500/20" : "border-neutral-100/50 dark:border-white/5")
        )}>
          <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto justify-center sm:justify-start order-2 sm:order-1">
            <button
              type="button"
              onClick={handleFileClick}
              className={cn(
                "p-3.5 rounded-2xl transition-all duration-300 active:scale-95",
                mode === "Code" 
                  ? "text-green-900 hover:text-green-400 hover:bg-green-500/5" 
                  : (mode === "Image"
                      ? "text-purple-400 hover:text-purple-600 hover:bg-purple-500/5"
                      : "text-neutral-400 hover:text-black dark:text-neutral-600 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800/50")
              )}
              title="Attach Reference"
            >
              <ImageIcon className="w-5 h-5" />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
            
            <button
              type="button"
              onClick={toggleListening}
              className={cn(
                "p-3.5 rounded-2xl transition-all duration-300 flex items-center justify-center active:scale-95",
                isListening 
                  ? "bg-red-50 text-red-500 dark:bg-red-500/10 animate-pulse ring-4 ring-red-500/5" 
                  : (mode === "Code" 
                      ? "text-green-900 hover:text-green-400 hover:bg-green-500/5" 
                      : (mode === "Image"
                          ? "text-purple-400 hover:text-purple-600 hover:bg-purple-500/5"
                          : "text-neutral-400 hover:text-black dark:text-neutral-600 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800/50"))
              )}
              title="Voice Input"
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={disabled || !value.trim() || isLimitReached}
            className={cn(
              "group relative w-full sm:w-auto px-8 py-4 rounded-[20px] md:rounded-[24px] text-[13px] md:text-[15px] font-black uppercase tracking-[0.12em] md:tracking-[0.15em] transition-all duration-500 overflow-hidden shadow-2xl flex items-center justify-center order-1 sm:order-2",
              mode === "Code" 
                ? (value.trim() && !disabled && !isLimitReached ? "bg-green-500 text-black hover:bg-green-400" : "bg-green-900/20 text-green-900")
                : (mode === "Image"
                    ? (value.trim() && !disabled && !isLimitReached ? "bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white hover:scale-[1.02]" : "bg-purple-900/20 text-purple-900")
                    : (value.trim() && !disabled && !isLimitReached
                      ? "bg-black text-white dark:bg-white dark:text-black hover:-translate-y-1 active:translate-y-0"
                      : "bg-neutral-100 text-neutral-300 dark:bg-neutral-900 dark:text-neutral-800 cursor-not-allowed"))
            )}
          >
            <span className="relative z-10 flex items-center gap-3">
              {isGenerating ? t.labels.Forging : mode === "Code" ? t.buttons.Code : (mode === "Image" ? t.buttons.Image : t.buttons.Forge)}
              
              <div className="relative w-5 h-5 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {isGenerating ? (
                    <motion.div
                      key="rocket"
                      initial={{ y: 20, opacity: 0, scale: 0.5 }}
                      animate={{ y: -40, opacity: [0, 1, 0], scale: [0.5, 1, 0.8] }}
                      transition={{ duration: 0.8, ease: "easeIn", repeat: Infinity }}
                    >
                      <Rocket className={cn("w-5 h-5", (mode === "Code" || mode === "Image") ? "text-black" : "text-white dark:text-black")} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="arrow"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                    >
                      <ArrowUp className={cn("w-5 h-5 transition-transform", !disabled && "group-hover:-translate-y-1")} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </span>
            {isGenerating && (
              <motion.div 
                className={cn("absolute inset-0", mode === "Code" ? "bg-white/10" : (mode === "Image" ? "bg-white/20" : "bg-black/5 dark:bg-white/5"))}
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              />
            )}
          </button>
        </div>
      </div>
    </form>
  );
};
