import React, { useState } from "react";
import { Copy, Check, RotateCcw, Zap, Scissors, ChevronRight, Sparkles, Terminal, Palette } from "lucide-react";
import { AppMode, GeneratedPrompt, Platform, Language, RefinementType } from "../types";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { Typewriter } from "./Typewriter";
import { translations } from "../lib/translations";

interface PromptResponseProps {
  request: string;
  platform: Platform;
  response: GeneratedPrompt;
  onRegenerate: () => void;
  onRefine: (type: RefinementType) => void;
  mode: AppMode;
  lang: Language;
}

export const PromptResponse: React.FC<PromptResponseProps> = ({
  request,
  platform,
  response,
  onRegenerate,
  onRefine,
  mode,
  lang,
}) => {
  const t = translations[lang];
  const [copied, setCopied] = useState(false);
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(response.engineeredPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isImage = mode === "Image";
  const isCode = mode === "Code";
  const responseLabel = isCode
    ? (lang === 'fr' ? 'Résultat Système Compilé' : (lang === 'ar' ? 'نتيجة النظام المترجمة' : (lang === 'tr' ? 'Derlenmiş Sistem Sonucu' : (lang === 'ru' ? 'Скомпилированный результат системы' : 'Compiled System Result'))))
    : isImage
      ? (lang === 'fr' ? 'Prompt Image Prêt' : (lang === 'ar' ? 'مطالبة الصورة جاهزة' : (lang === 'tr' ? 'Görsel Prompt Hazır' : (lang === 'ru' ? 'Промпт изображения готов' : 'Image Prompt Ready'))))
      : (lang === 'fr' ? 'Prompt Prêt' : (lang === 'ar' ? 'المطالبة جاهزة' : (lang === 'tr' ? 'Prompt Hazır' : (lang === 'ru' ? 'Промпт готов' : 'Prompt Ready'))));
  const refinementActions: Array<{ type: RefinementType; label: string; icon: React.ReactNode }> = [
    {
      type: "concise",
      label: lang === "en" ? "Make Shorter" : (isCode ? t.refinements.CodeConcise : (isImage ? t.refinements.ImageConcise : t.refinements.Concise)),
      icon: <Scissors className="w-4 h-4 transition-transform group-hover:scale-110" />,
    },
    {
      type: "technician",
      label: lang === "en" ? "More Advanced" : (isCode ? t.refinements.CodeTechnician : (isImage ? t.refinements.ImageTechnician : t.refinements.Technician)),
      icon: <Zap className="w-4 h-4 transition-transform group-hover:scale-110 group-hover:text-amber-500" />,
    },
    {
      type: "corporate",
      label: "More Corporate",
      icon: <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />,
    },
    {
      type: "creative",
      label: "More Creative",
      icon: <Sparkles className="w-4 h-4 transition-transform group-hover:scale-110" />,
    },
    {
      type: "adapt",
      label: "Adapt Platform",
      icon: <RotateCcw className="w-4 h-4 transition-transform group-hover:rotate-180 duration-500" />,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "w-full max-w-4xl mx-auto py-4 md:py-10 px-0 md:px-4 flex flex-col gap-6 md:gap-10",
        isCode && "font-mono"
      )}
    >
      {/* User Query Layer */}
      <motion.div 
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex gap-3 md:gap-5 px-4 md:px-2"
      >
        <div className={cn(
          "w-8 h-8 rounded-full flex-shrink-0 animate-pulse",
          isCode ? "bg-green-500/10 border border-green-500/30" : (isImage ? "bg-purple-500/10 border border-purple-500/30" : "bg-neutral-200 dark:bg-neutral-800")
        )}></div>
        <div className="pt-1.5 flex-1 text-left">
          <p className={cn(
            "text-[14px] font-medium italic",
            isCode ? "text-green-500/70" : (isImage ? "text-purple-600 dark:text-purple-400" : "text-neutral-600 dark:text-neutral-400")
          )}>"{request}"</p>
        </div>
      </motion.div>

      {/* Response Layer */}
      <div className="flex gap-3 md:gap-5">
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ring-4 hidden sm:flex",
          isCode 
            ? "bg-green-500 text-black ring-green-500/10" 
            : (isImage ? "bg-gradient-to-br from-pink-500 to-purple-500 text-white ring-purple-500/10" : "bg-black dark:bg-white ring-black/5 dark:ring-white/5")
        )}>
          {isCode ? <Terminal className="w-4 h-4" /> : (isImage ? <Palette className="w-4 h-4" /> : <div className="w-3 h-3 border-2 border-white dark:border-black rotate-45"></div>)}
        </div>
        
        <div className={cn(
          "flex-1 backdrop-blur-3xl border rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden",
          isCode 
            ? "bg-black/90 border-green-500/30 text-green-400" 
            : (isImage 
                ? "bg-white/60 dark:bg-black/60 border-purple-500/20 text-purple-900 dark:text-purple-100 shadow-[0_40px_100px_rgba(168,85,247,0.15)]"
                : "bg-white/50 dark:bg-[#080808]/50 border-neutral-200 dark:border-white/10")
        )}>
          <div className="p-4 md:p-8 space-y-4 md:space-y-6 text-left">
            <div className={cn(
              "flex items-center justify-between border-b pb-4 md:pb-5",
              isCode ? "border-green-500/10" : (isImage ? "border-purple-500/10" : "border-neutral-50 dark:border-white/5")
            )}>
              <div className="flex items-center gap-2">
                <Sparkles className={cn("w-4 h-4 animate-spin-slow", isCode ? "text-green-500" : (isImage ? "text-purple-500" : "text-amber-500"))} />
                <span className={cn(
                  "text-[11px] font-black uppercase tracking-[0.2em]",
                  isCode ? "text-green-500/50" : (isImage ? "text-purple-500/60" : "text-neutral-400 dark:text-neutral-500")
                )}>
                  {responseLabel}
                </span>
              </div>
              <button
                onClick={handleCopy}
                className={cn(
                  "px-4 py-1.5 rounded-xl text-[12px] font-bold transition-all flex items-center gap-2 border",
                  copied 
                    ? "bg-green-500/10 text-green-500 border-green-500/20" 
                    : (mode === "Code" 
                        ? "bg-black text-green-400 border-green-500/30 hover:bg-green-500/10" 
                        : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-white/10 hover:border-black dark:hover:border-white")
                )}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            <div className={cn(
              "text-[14px] md:text-[15px] leading-relaxed font-medium p-4 md:p-6 rounded-xl md:rounded-2xl border shadow-inner relative overflow-hidden group",
              isCode 
                ? "bg-green-500/5 border-green-500/20 text-green-300 font-mono" 
                : (isImage 
                    ? "bg-purple-500/5 border-purple-500/10 text-purple-800 dark:text-purple-200"
                    : "bg-neutral-50 dark:bg-white/[0.02] text-neutral-800 dark:text-neutral-100 border-neutral-100 dark:border-white/5")
            )}>
              <span className={cn(
                "font-black text-[11px] uppercase tracking-widest block mb-4 border-b pb-1 w-fit",
                isCode ? "text-green-500 border-green-500/20" : (isImage ? "text-purple-500 border-purple-500/20" : "text-indigo-500 dark:text-indigo-400 border-indigo-500/10")
              )}>
                {isCode ? (lang === 'fr' ? 'Logique d\'Exécution' : (lang === 'ar' ? 'منطق التنفيذ' : (lang === 'tr' ? 'Yürütme Mantığı' : (lang === 'ru' ? 'Логика выполнения' : 'Execution Logic')))) : (isImage ? (lang === 'fr' ? 'Cœur Esthétique' : (lang === 'ar' ? 'الجوهر الجمالي' : (lang === 'tr' ? 'Estetik Çekirdek' : (lang === 'ru' ? 'Эстетическое ядро' : 'Aesthetic Core')))) : (lang === 'fr' ? 'Géométrie Objective' : (lang === 'ar' ? 'الهندسة الموضوعية' : (lang === 'tr' ? 'Nesnel Geometri' : (lang === 'ru' ? 'Объективная геометрия' : 'Objective Geometry')))))}
              </span> 
              <p className="mb-8 opacity-80 leading-relaxed">
                <Typewriter text={response.goal} speed={15} />
              </p>
              
              <span className={cn(
                "font-black text-[11px] uppercase tracking-widest block mb-3 border-b pb-1 w-fit",
                isCode ? "text-green-500 border-green-500/20" : (isImage ? "text-pink-500 border-pink-500/20" : "text-indigo-500 dark:text-indigo-400 border-indigo-500/10")
              )}>
                {isCode ? (lang === 'fr' ? 'Source Ingéniée' : (lang === 'ar' ? 'المصد المهندس' : (lang === 'tr' ? 'Mühendislik Kaynağı' : (lang === 'ru' ? 'Инженерный исходник' : 'Engineered Source')))) : (isImage ? t.labels.Prompt : t.labels.Architecture)}
              </span>
              <div className={cn(
                "whitespace-pre-wrap leading-relaxed",
                isCode ? "selection:bg-green-500/40" : (isImage ? "selection:bg-pink-500/40" : "selection:bg-indigo-500/20")
              )}>
                <Typewriter 
                  text={response.engineeredPrompt} 
                  speed={8} 
                  delay={1000} 
                  onComplete={() => setIsTypingComplete(true)}
                />
              </div>
            </div>

            <AnimatePresence>
              {isTypingComplete && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "p-5 rounded-2xl border transition-all",
                    isCode 
                      ? "bg-green-500/5 border-green-500/20 hover:bg-green-500/[0.07]" 
                      : (isImage 
                          ? "bg-pink-500/5 border-pink-500/20 hover:bg-pink-500/[0.07]" 
                          : "bg-indigo-500/5 border-indigo-500/20 hover:bg-indigo-500/[0.07]")
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className={cn("w-3.5 h-3.5", isCode ? "text-green-500" : (isImage ? "text-pink-500" : "text-indigo-500"))} />
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-[0.2em] block",
                      isCode ? "text-green-500" : (isImage ? "text-pink-500" : "text-indigo-500")
                    )}>
                      {isCode ? (lang === 'fr' ? 'Raisonnement du Compilateur' : (lang === 'ar' ? 'منطق المترجم' : (lang === 'tr' ? 'Derleyici Akıl Yürütme' : (lang === 'ru' ? 'Рассуждения компилятора' : 'Compiler Reasoning')))) : (isImage ? (lang === 'fr' ? 'Stratégie Artistique' : (lang === 'ar' ? 'الاستراتيجية الفنية' : (lang === 'tr' ? 'Sanatsal Strateji' : (lang === 'ru' ? 'Художественная стратегия' : 'Artistic Strategy')))) : (lang === 'fr' ? 'Analyse du Raisonnement Expert' : (lang === 'ar' ? 'تحليل منطق الخبراء' : (lang === 'tr' ? 'Uzman Akıl Yürütme Analizi' : (lang === 'ru' ? 'Экспертный анализ рассуждений' : 'Expert Reasoning Analysis')))))}
                    </span>
                  </div>
                  <p className={cn(
                    "text-[13px] leading-relaxed italic font-medium",
                    mode === "Code" ? "text-green-500/60" : "text-neutral-500 dark:text-neutral-400"
                  )}>
                    <Typewriter text={response.explanation} speed={5} delay={500} />
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {isTypingComplete && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-wrap gap-3 pt-4"
                >
                  <button
                    onClick={onRegenerate}
                    className={cn(
                      "group px-6 py-3 rounded-xl text-[12px] font-black uppercase tracking-[0.15em] transition-all hover:scale-105 active:scale-95 flex items-center gap-2 shadow-xl",
                      isCode ? "bg-green-500 text-black" : (isImage ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white" : "bg-black dark:bg-white text-white dark:text-black")
                    )}
                  >
                    <RotateCcw className="w-4 h-4 transition-transform group-hover:rotate-180 duration-500" />
                    {isCode ? t.refinements.CodeReforge : (isImage ? t.refinements.ImageReforge : t.refinements.Reforge)}
                  </button>
                  {refinementActions.map((action) => (
                    <button
                      key={action.type}
                      onClick={() => onRefine(action.type)}
                      className={cn(
                        "group px-4 md:px-5 py-3 border rounded-xl text-[11px] md:text-[12px] font-black uppercase tracking-[0.12em] md:tracking-[0.15em] transition-all flex items-center gap-2 shadow-sm",
                        isCode
                          ? "bg-black text-green-500 border-green-500/20 hover:border-green-500"
                          : (isImage
                              ? "bg-white text-purple-600 border-purple-200 hover:border-purple-500"
                              : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-white/10 hover:border-black dark:hover:border-white")
                      )}
                    >
                      {action.icon}
                      {action.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
