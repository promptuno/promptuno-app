import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUp, Image as ImageIcon, Mic, MicOff, Rocket, Sparkles, TerminalSquare, X } from "lucide-react";
import { cn } from "../lib/utils";
import { AppMode, Platform } from "../types";
import { PLATFORMS } from "../constants";
import { motion, AnimatePresence } from "motion/react";
import { Language } from "../types";
import { translations } from "../lib/translations";
import { modelGuidance } from "../lib/productLayers";
import { modeThemes } from "../lib/modeThemes";

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
  onCancel?: () => void;
  lang: Language;
  isMobileViewport?: boolean;
  isMobileComposerOpen?: boolean;
  onMobileComposerOpen?: () => void;
  onMobileComposerClose?: () => void;
}

const getModeIcon = (mode: AppMode) => {
  if (mode === "Image") return <ImageIcon className="w-6 h-6" />;
  if (mode === "Vibe") return <TerminalSquare className="w-6 h-6" />;
  return <Sparkles className="w-6 h-6" />;
};

function getVibePreviewLines(platform: Platform, seedText: string) {
  if (/(shadcn|textarea|button|tailwind|typescript|component|react)/i.test(seedText)) {
    return [
      "$ audit-stack --react --tailwind --typescript",
      "$ npx shadcn@latest add textarea button",
      "$ npm i lucide-react @radix-ui/react-slot class-variance-authority",
      `$ wire-ui --target ${platform.toLowerCase()} --components /components/ui`,
    ];
  }

  return [
    "$ define-stack --intent ship something polished",
    "$ add-constraints --responsive --fast --clean",
    "$ map-deliverables --ui --logic --edge-cases",
    `$ shape-prompt --platform ${platform.toLowerCase()}`,
  ];
}

const vibeQuickActions = [
  "Generate Code",
  "Launch App",
  "UI Components",
  "Theme Ideas",
  "Dashboard Build",
  "Landing Page",
  "Upload Docs",
  "Image Assets",
] as const;

const AmbientVisuals: React.FC<{ mode: AppMode; platform: Platform; seedText: string }> = ({ mode, platform, seedText }) => {
  if (mode === "Image") {
    return (
      <div className="pointer-events-none absolute inset-0 hidden overflow-hidden opacity-35 lg:block">
        {[
          "top-10 right-10 w-24 h-32 from-amber-300/28 via-pink-300/12 to-white/0",
          "bottom-12 left-10 w-28 h-20 from-orange-300/18 via-amber-300/10 to-white/0",
        ].map((card, index) => (
          <motion.div
            key={card}
            initial={false}
            animate={{ y: [0, index % 2 ? -10 : 10, 0], rotate: [index - 1, index + 1, index - 1] }}
            transition={{ duration: 7 + index, repeat: Infinity, ease: "easeInOut" }}
            className={cn(
              "absolute rounded-[28px] border border-white/30 dark:border-white/10 bg-gradient-to-br shadow-[0_24px_80px_rgba(0,0,0,0.08)] dark:shadow-[0_24px_90px_rgba(0,0,0,0.18)] backdrop-blur-2xl",
              card
            )}
          >
            <div className="absolute inset-3 rounded-[22px] border border-white/20 dark:border-white/10 bg-white/35 dark:bg-white/[0.06]" />
            <div className="absolute inset-x-5 top-5 h-2 rounded-full bg-white/60 dark:bg-white/15" />
            <div className="absolute inset-x-5 top-11 h-16 rounded-[18px] bg-white/35 dark:bg-white/[0.06]" />
            <div className="absolute left-5 right-12 bottom-7 h-2 rounded-full bg-white/50 dark:bg-white/12" />
          </motion.div>
        ))}
      </div>
    );
  }

  if (mode === "Vibe") {
    const lines = getVibePreviewLines(platform, seedText);
    return (
      <div className="pointer-events-none absolute inset-0 hidden overflow-hidden lg:block">
        <div className="absolute right-8 top-28 w-[34%] max-w-[260px] rounded-[24px] border border-emerald-400/12 bg-white/25 dark:bg-[#07120f]/42 backdrop-blur-2xl shadow-[0_18px_55px_rgba(7,18,15,0.14)] opacity-70">
          <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-emerald-400/10">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-300/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-300/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-blue-300/60" />
            <span className="ml-2 text-[8px] font-black uppercase tracking-[0.22em] text-emerald-700/55 dark:text-emerald-200/55">
              vibe-code.prompt
            </span>
          </div>
          <div className="px-4 py-3 space-y-1.5 font-mono text-[9px] leading-relaxed text-emerald-800/55 dark:text-emerald-200/48">
            {lines.map((line) => (
              <div key={line}>{line}</div>
            ))}
          </div>
        </div>
        <div className="absolute inset-x-8 bottom-24 h-px bg-gradient-to-r from-transparent via-emerald-400/18 to-transparent" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(52,211,153,0.035)_1px,transparent_1px)] bg-[length:100%_22px] opacity-50" />
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-65">
      <motion.div
        initial={false}
        animate={{ x: [0, 24, 0], y: [0, 8, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-10 right-10 h-28 w-28 rounded-full bg-violet-400/10 blur-3xl"
      />
      <motion.div
        initial={false}
        animate={{ x: [0, -18, 0], y: [0, -12, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-8 left-8 h-24 w-24 rounded-full bg-sky-400/10 blur-3xl"
      />
    </div>
  );
};

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
  onCancel,
  lang,
  isMobileViewport = false,
  isMobileComposerOpen = true,
  onMobileComposerOpen,
  onMobileComposerClose,
}) => {
  const t = translations[lang];
  const theme = modeThemes[mode];
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isListening, setIsListening] = useState(false);
  const [isLimitDismissed, setIsLimitDismissed] = useState(false);
  const [placeholderText, setPlaceholderText] = useState("");
  const recognitionRef = useRef<any>(null);
  const usagePercent = Math.max(0, Math.min(100, (usageRemaining / usageLimit) * 100));
  const vibePreviewLines = useMemo(() => getVibePreviewLines(platform, value), [platform, value]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  useEffect(() => {
    const examples =
      mode === "Image"
        ? [
            "Create an image prompt for a cinematic fashion campaign at golden hour...",
            "Turn my rough concept into a polished product-render image prompt...",
            "Build an image prompt with lighting, lens, style, and composition...",
          ]
        : mode === "Vibe"
          ? [
              `Create a ${platform} vibe-coding prompt for a polished SaaS landing page build...`,
              "Turn my app idea into a terminal-clean build prompt with stack, UX goals, and constraints...",
              "Create a coding prompt with feature scope, edge cases, polish targets, and exact output format...",
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
        isListening && theme.accentBorder
      )}>
        <div className={cn("absolute inset-x-0 top-0 h-1 opacity-90", theme.accentGradient)} />
        <div className={cn("absolute -top-16 -right-10 w-40 h-40 rounded-full blur-3xl", theme.orbPrimary)} />
        <div className={cn("absolute -bottom-16 -left-10 w-40 h-40 rounded-full blur-3xl", theme.orbSecondary)} />
        <AmbientVisuals mode={mode} platform={platform} seedText={value} />
        {mode === "Vibe" && (
          <div className="relative z-10 mb-6 md:mb-8 text-center">
            <div className="text-[11px] font-black uppercase tracking-[0.24em] text-emerald-700/65 dark:text-emerald-300/65">
              Promptuno Vibe
            </div>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold text-neutral-950 dark:text-white">
              Build something polished.
            </h2>
            <p className="mt-2 text-sm md:text-base text-neutral-500 dark:text-neutral-400">
              Drop in the component, stack, prompt rules, and the design language you want carried through.
            </p>
          </div>
        )}
        {isLimitReached && !isLimitDismissed && (
          <div className="absolute inset-0 z-50 backdrop-blur-xl bg-white/20 dark:bg-black/20 flex flex-col items-center justify-center p-5 text-center animate-in fade-in duration-500">
            <div className="bg-white dark:bg-neutral-900 p-6 md:p-8 rounded-[28px] md:rounded-[32px] shadow-2xl border border-neutral-100 dark:border-white/10 max-w-sm">
              <div className={cn("w-12 h-12 rounded-3xl flex items-center justify-center mx-auto mb-4", theme.accentSoft, theme.accentBorder, "border")}>
                <div className={theme.accentText}>{getModeIcon(mode)}</div>
              </div>
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
                className={cn("px-6 py-2 text-white rounded-full text-[10px] font-black uppercase tracking-widest transition-colors shadow-lg", theme.accentStrong)}
              >
                {t.buttons.Unlock}
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 mb-5 md:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span className="text-[11px] md:text-[13px] font-black uppercase tracking-[0.16em] md:tracking-[0.18em] text-neutral-400 dark:text-neutral-600 text-center sm:text-left">
              {theme.description}
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-neutral-400 dark:text-neutral-500 text-center sm:text-right">
              {platform}
            </span>
          </div>

          <div className="relative grid grid-cols-4 gap-1 p-1.5 rounded-[20px] border bg-white/35 dark:bg-white/5 border-neutral-200/60 dark:border-white/5 backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] dark:shadow-none">
            {PLATFORMS.map((p) => (
              <motion.button
                key={p}
                type="button"
                onClick={() => onPlatformChange(p)}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.985 }}
                className={cn(
                  "relative min-w-0 px-2 sm:px-4 py-2.5 text-[10px] sm:text-[11px] font-bold rounded-[16px] transition-all duration-500 overflow-hidden",
                  platform === p
                    ? "text-black dark:text-white"
                    : "text-neutral-400 hover:text-neutral-600 dark:text-neutral-600 dark:hover:text-neutral-400"
                )}
              >
                {platform === p && (
                  <>
                    <motion.div
                      layoutId="platform-pill"
                      className={cn("absolute inset-0 shadow-sm rounded-[16px] -z-0 border bg-white/95 dark:bg-neutral-900/95", theme.accentBorder)}
                      transition={{ type: "spring", bounce: 0.2, stiffness: 280, damping: 24 }}
                    />
                    <motion.div
                      layoutId="platform-sheen"
                      className="absolute inset-x-3 top-1 h-5 rounded-full bg-white/50 dark:bg-white/[0.05] blur-xl -z-0"
                      transition={{ type: "spring", bounce: 0.18, stiffness: 260, damping: 24 }}
                    />
                  </>
                )}
                <span className="relative z-10 truncate block">{p}</span>
              </motion.button>
            ))}
          </div>

          {modelGuidance[platform] && (
            <p className="text-[11px] leading-relaxed font-medium text-center sm:text-left text-neutral-400 dark:text-neutral-500">
              {mode === "Image"
                ? `Use ${platform} to sharpen subject, style, lighting, composition, and visual constraints.`
                : mode === "Vibe"
                  ? `${platform} works best here with stack details, UX goals, constraints, and exact deliverables.`
                  : modelGuidance[platform]}
            </p>
          )}
        </div>

        {showCollapsedComposer ? (
          <button
            type="button"
            onClick={openMobileComposer}
            className={cn("w-full text-left rounded-[28px] border bg-neutral-50/70 dark:bg-white/[0.03] px-4 py-5 transition-all", theme.accentBorder, "hover:border-neutral-200 dark:hover:border-white/10")}
          >
            <div className="flex items-start gap-3">
              <div className={cn("w-11 h-11 rounded-2xl bg-white dark:bg-neutral-900 border flex items-center justify-center shadow-sm", theme.accentBorder)}>
                <div className={theme.accentText}>{getModeIcon(mode)}</div>
              </div>
              <div className="min-w-0 flex-1">
                <div className={cn("text-[11px] font-black uppercase tracking-[0.16em]", theme.accentText)}>
                  {theme.label}
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
            <div className={cn("mt-1", theme.accentText)}>{getModeIcon(mode)}</div>
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholderText || t.placeholders[mode].replace("{platform}", platform)}
              className={cn(
                "flex-1 bg-transparent border-none focus:ring-0 resize-none text-[17px] md:text-[22px] font-medium leading-relaxed p-0 min-h-[150px] md:min-h-[140px] max-h-[500px] placeholder-neutral-200 dark:placeholder-neutral-800",
                mode === "Vibe" ? "text-emerald-950 dark:text-emerald-100 font-mono" : "text-neutral-900 dark:text-white"
              )}
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

        {mode === "Vibe" && (
          <div className="mt-4 flex flex-wrap gap-2">
            {vibePreviewLines.slice(0, 3).map((line) => (
              <div
                key={line}
                className="rounded-full border border-emerald-500/14 bg-emerald-500/[0.06] px-3 py-1.5 font-mono text-[10px] font-semibold text-emerald-700/75 dark:text-emerald-300/70"
              >
                {line}
              </div>
            ))}
          </div>
        )}

        {mode === "Vibe" && !value.trim() && (
          <div className="mt-6 flex items-center justify-center flex-wrap gap-3">
            {vibeQuickActions.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() =>
                  onChange(`Create a ${platform} vibe-coding prompt for ${label.toLowerCase()} using React, Tailwind, TypeScript, shadcn/ui, responsive behavior, and implementation steps.`)
                }
                className="rounded-full border border-neutral-200/70 dark:border-white/10 bg-black/5 dark:bg-white/[0.04] px-3.5 py-2 text-[11px] font-semibold text-neutral-600 dark:text-neutral-300 transition-all hover:bg-black/10 hover:text-neutral-900 dark:hover:bg-white/[0.08] dark:hover:text-white"
              >
                {label}
              </button>
            ))}
          </div>
        )}

        <div className={cn("mt-5 rounded-2xl border p-3 flex items-center justify-between gap-3 bg-neutral-50/70 dark:bg-white/[0.03]", theme.accentBorder)}>
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
              className={cn("h-full rounded-full", usageRemaining <= 1 ? "bg-red-500" : theme.accentGradient)}
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

          <div className="order-2 sm:order-3 flex w-full sm:w-auto items-center gap-3">
            {isGenerating && onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-3 rounded-[18px] border border-neutral-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] text-[11px] font-black uppercase tracking-[0.14em] text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-all"
              >
                Stop
              </button>
            )}
            <motion.button
              type="submit"
              whileHover={value.trim() && !disabled && !isLimitReached ? { y: -2, scale: 1.01 } : undefined}
              whileTap={value.trim() && !disabled && !isLimitReached ? { scale: 0.98 } : undefined}
              disabled={disabled || !value.trim() || isLimitReached}
              className={cn(
                "group relative w-full sm:w-auto px-8 py-4 rounded-[20px] md:rounded-[24px] text-[13px] md:text-[15px] font-black uppercase tracking-[0.12em] md:tracking-[0.15em] transition-all duration-500 overflow-hidden shadow-2xl flex items-center justify-center",
                value.trim() && !disabled && !isLimitReached
                  ? cn("text-white", theme.accentGradient, theme.accentGlow)
                  : "bg-neutral-100 text-neutral-300 dark:bg-neutral-900 dark:text-neutral-800 cursor-not-allowed"
              )}
            >
              <span className="absolute inset-[1px] rounded-[19px] bg-white/[0.08] dark:bg-white/[0.04]" />
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
                        <ArrowUp className="w-5 h-5 transition-transform group-hover:-translate-y-1" />
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
            </motion.button>
          </div>
        </div>
      </div>
    </form>
  );
};
