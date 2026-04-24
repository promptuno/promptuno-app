import React, { useRef, useEffect, useState } from "react";
import { ArrowUp, Mic, MicOff, Rocket, Sparkles, X } from "lucide-react";
import { cn } from "../lib/utils";
import { AppMode, Platform } from "../types";
import { PLATFORMS } from "../constants";
import { motion, AnimatePresence } from "motion/react";
import { Language } from "../types";
import { translations } from "../lib/translations";
import { modelGuidance } from "../lib/productLayers";

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
  usageRemaining?: number;
  usageLimit?: number;
  onUpgrade?: () => void;
  lang: Language;
  isMobileViewport?: boolean;
  isMobileComposerOpen?: boolean;
  onMobileComposerOpen?: () => void;
  onMobileComposerClose?: () => void;
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
  usageRemaining = 0,
  usageLimit = 5,
  onUpgrade,
  lang,
  isMobileViewport = false,
  isMobileComposerOpen = true,
  onMobileComposerOpen,
  onMobileComposerClose,
}) => {
  const t = translations[lang];
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isListening, setIsListening] = useState(false);
  const [isLimitDismissed, setIsLimitDismissed] = useState(false);
  const [placeholderText, setPlaceholderText] = useState("");
  const recognitionRef = useRef<any>(null);
  const usagePercent = Math.max(0, Math.min(100, (usageRemaining / usageLimit) * 100));

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  useEffect(() => {
    if (isMobileViewport && !isMobileComposerOpen) return;
    textareaRef.current?.focus({ preventScroll: true });
  }, [mode, platform, isMobileViewport, isMobileComposerOpen]);

  useEffect(() => {
    const examples =
      mode === "Image"
        ? [
            "Create an image prompt for a cinematic fashion campaign at golden hour...",
            "Turn my rough concept into a polished product-render image prompt...",
            "Build an image prompt with lighting, lens, style, and composition...",
          ]
        : mode === "Code"
          ? [
              `Create a stronger ${platform} coding prompt for a full-stack feature build...`,
              "Turn my bug report into a precise debugging prompt with acceptance criteria...",
              "Create a code prompt with stack, constraints, edge cases, and output format...",
            ]
          : mode === "Vibe"
            ? [
                "Build a prompt that sharpens this brand voice into a confident premium tone...",
                "Turn my rough idea into a prompt for naming, mood, and creative direction...",
                "Create a prompt that helps the AI capture the exact aesthetic and feel...",
              ]
            : [
                `Create a stronger ${platform} prompt for a startup launch plan...`,
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
      return;
    }

    try {
      recognitionRef.current?.start();
    } catch (e) {
      console.error("Speech recognition error:", e);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const openMobileComposer = () => {
    onMobileComposerOpen?.();
    window.setTimeout(() => textareaRef.current?.focus({ preventScroll: true }), 120);
  };

  const showCollapsedComposer = isMobileViewport && !isMobileComposerOpen && !value.trim();

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSend(); }}
      className="w-full max-w-3xl mx-auto"
    >
      <div className={cn(
        "relative flex flex-col p-5 md:p-8 backdrop-blur-3xl border transition-all duration-500 overflow-hidden bg-white/70 dark:bg-[#080808]/70 border-neutral-200 dark:border-white/10 rounded-[32px] md:rounded-[40px] shadow-[0_30px_70px_rgba(0,0,0,0.04)] dark:shadow-[0_40px_120px_rgba(0,0,0,0.8)]",
        disabled && "opacity-80 grayscale-[0.5]",
        isListening && "ring-2 ring-indigo-500/20"
      )}>
        {isLimitReached && !isLimitDismissed && (
          <div className="absolute inset-0 z-50 backdrop-blur-xl bg-white/20 dark:bg-black/20 flex flex-col items-center justify-center p-5 text-center animate-in fade-in duration-500">
            <div className="bg-white dark:bg-neutral-900 p-6 md:p-8 rounded-[28px] md:rounded-[32px] shadow-2xl border border-neutral-100 dark:border-white/10 max-w-sm">
              <Sparkles className="w-10 h-10 text-indigo-500 mx-auto mb-4" />
              <h3 className="text-xl font-black uppercase tracking-tight mb-2">{t.labels.LimitReached}</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-5">{t.labels.LimitDescription}</p>
              <p className="text-[11px] text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-[0.18em] mb-6">
                Use Promptuno on the web and inside your browser.
              </p>

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

        <div className="flex flex-col gap-3 mb-5 md:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span className="text-[11px] md:text-[14px] font-black uppercase tracking-[0.16em] md:tracking-[0.2em] text-neutral-400 dark:text-neutral-600 text-center sm:text-left">
              {mode} prompts for
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-neutral-400 dark:text-neutral-500 text-center sm:text-right">
              Perfect prompt engineering
            </span>
          </div>

          <div className="relative grid grid-cols-4 gap-1 p-1 rounded-2xl border bg-neutral-100/50 dark:bg-white/5 border-neutral-200/50 dark:border-white/5">
            {PLATFORMS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => onPlatformChange(p)}
                className={cn(
                  "relative min-w-0 px-2 sm:px-4 py-2.5 text-[10px] sm:text-[11px] font-bold rounded-xl transition-all duration-300",
                  platform === p
                    ? "text-black dark:text-white"
                    : "text-neutral-400 hover:text-neutral-600 dark:text-neutral-600 dark:hover:text-neutral-400"
                )}
              >
                {platform === p && (
                  <motion.div
                    layoutId="platform-pill"
                    className="absolute inset-0 shadow-sm rounded-xl -z-0 border bg-white dark:bg-neutral-800 border-neutral-100 dark:border-white/10"
                    transition={{ type: "spring", bounce: 0.1, duration: 0.5 }}
                  />
                )}
                <span className="relative z-10 truncate block">{p}</span>
              </button>
            ))}
          </div>

          {modelGuidance[platform] && (
            <p className="text-[11px] leading-relaxed font-medium text-center sm:text-left text-neutral-400 dark:text-neutral-500">
              {mode === "Image"
                ? `Use ${platform} to sharpen subject, style, lighting, composition, and visual constraints.`
                : mode === "Code"
                  ? `${platform} prompts work best with stack details, acceptance criteria, edge cases, and exact output format.`
                  : mode === "Vibe"
                    ? `${platform} can sharpen tone, mood, brand direction, and aesthetic clarity.`
                    : modelGuidance[platform]}
            </p>
          )}
        </div>

        {showCollapsedComposer ? (
          <button
            type="button"
            onClick={openMobileComposer}
            className="w-full text-left rounded-[28px] border border-neutral-100 dark:border-white/5 bg-neutral-50/70 dark:bg-white/[0.03] px-4 py-5 transition-all hover:border-neutral-200 dark:hover:border-white/10"
          >
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-white/5 flex items-center justify-center shadow-sm">
                <Sparkles className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-black uppercase tracking-[0.16em] text-neutral-400 dark:text-neutral-500">
                  {mode} prompts
                </div>
                <div className="mt-2 text-[15px] font-semibold text-neutral-900 dark:text-white leading-relaxed">
                  {placeholderText || t.placeholders[mode].replace("{platform}", platform)}
                </div>
                <div className="mt-3 text-[11px] font-bold text-neutral-400 dark:text-neutral-500">
                  Tap to start
                </div>
              </div>
            </div>
          </button>
        ) : (
          <div className="flex items-start gap-3 md:gap-4">
            <Sparkles className="w-6 h-6 text-neutral-300 dark:text-neutral-700 mt-1" />
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholderText || t.placeholders[mode].replace("{platform}", platform)}
              className="flex-1 bg-transparent border-none focus:ring-0 resize-none text-[17px] md:text-[22px] font-medium leading-relaxed p-0 min-h-[150px] md:min-h-[140px] max-h-[500px] text-neutral-900 dark:text-white placeholder-neutral-200 dark:placeholder-neutral-800"
              disabled={disabled || isLimitReached}
            />
            {isMobileViewport && (
              <button
                type="button"
                onClick={onMobileComposerClose}
                className="mt-1 p-2 rounded-xl text-neutral-400 hover:text-neutral-900 dark:text-neutral-500 dark:hover:text-white transition-colors"
                aria-label="Close composer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        <div className="mt-5 rounded-2xl border p-3 flex items-center justify-between gap-3 bg-neutral-50/70 dark:bg-white/[0.03] border-neutral-100 dark:border-white/5">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-400 dark:text-neutral-500">
              Free generations left
            </div>
            <div className="text-[13px] font-black text-neutral-900 dark:text-white mt-0.5">
              {usageRemaining} of {usageLimit}
            </div>
          </div>
          <div className="w-28 h-2 rounded-full bg-neutral-200/70 dark:bg-white/10 overflow-hidden">
            <motion.div
              initial={false}
              animate={{ width: `${usagePercent}%` }}
              className={cn("h-full rounded-full", usageRemaining <= 1 ? "bg-red-500" : "bg-black dark:bg-white")}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mt-6 md:mt-8 pt-4 md:pt-6 border-t gap-4 border-neutral-100/50 dark:border-white/5">
          <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto justify-center sm:justify-start order-3 sm:order-1">
            <button
              type="button"
              onClick={toggleListening}
              className={cn(
                "p-3.5 rounded-2xl transition-all duration-300 flex items-center justify-center active:scale-95",
                isListening
                  ? "bg-red-50 text-red-500 dark:bg-red-500/10 animate-pulse ring-4 ring-red-500/5"
                  : "text-neutral-400 hover:text-black dark:text-neutral-600 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
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
              "group relative w-full sm:w-auto px-8 py-4 rounded-[20px] md:rounded-[24px] text-[13px] md:text-[15px] font-black uppercase tracking-[0.12em] md:tracking-[0.15em] transition-all duration-500 overflow-hidden shadow-2xl flex items-center justify-center order-2 sm:order-3",
              value.trim() && !disabled && !isLimitReached
                ? "bg-black text-white dark:bg-white dark:text-black hover:-translate-y-1 active:translate-y-0"
                : "bg-neutral-100 text-neutral-300 dark:bg-neutral-900 dark:text-neutral-800 cursor-not-allowed"
            )}
          >
            <span className="relative z-10 flex items-center gap-3">
              {isGenerating ? t.labels.Forging : t.buttons.Generate}
              <div className="relative w-5 h-5 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {isGenerating ? (
                    <motion.div
                      key="rocket"
                      initial={{ y: 20, opacity: 0, scale: 0.5 }}
                      animate={{ y: -40, opacity: [0, 1, 0], scale: [0.5, 1, 0.8] }}
                      transition={{ duration: 0.8, ease: "easeIn", repeat: Infinity }}
                    >
                      <Rocket className="w-5 h-5 text-white dark:text-black" />
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
                className="absolute inset-0 bg-black/5 dark:bg-white/5"
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
