import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Database, Cpu, Sparkles, BrainCircuit, ScanSearch, CheckCircle2 } from "lucide-react";
import { cn } from "../lib/utils";

import { Language } from "../types";
import { translations } from "../lib/translations";

interface AnalysisLoaderProps {
  platform: string;
  mode?: "Forge" | "Code" | "Image";
  lang: Language;
  request?: string;
}

const FlowingText = ({ text, delay = 0, className }: { text: string; delay?: number; className?: string }) => {
  const characters = text.split("");
  
  return (
    <div className={cn("inline-flex overflow-hidden", className)}>
      {characters.map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.3,
            delay: delay + i * 0.03,
            ease: "easeOut"
          }}
          className={char === " " ? "mr-[0.25em]" : ""}
        >
          {char}
        </motion.span>
      ))}
    </div>
  );
};

function getKeywords(request: string) {
  const stopWords = new Set([
    "the", "and", "for", "with", "that", "this", "from", "into", "make", "create", "write", "please", "prompt", "want",
    "une", "des", "les", "pour", "avec", "dans", "sur", "mon", "mes", "faire",
  ]);

  return request
    .toLowerCase()
    .replace(/[^a-z0-9\u00c0-\u024f\u0600-\u06ff\s-]/gi, " ")
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 3 && !stopWords.has(word))
    .slice(0, 5);
}

export const AnalysisLoader: React.FC<AnalysisLoaderProps> = ({ platform, mode = "Forge", lang, request = "" }) => {
  const t = translations[lang];
  const [currentStep, setCurrentStep] = useState(0);
  const keywords = getKeywords(request);
  const keywordText = keywords.length ? keywords.join(" / ") : platform;

  const steps = [
    { icon: Search, label: lang === 'en' ? "Reading Your Intent" : (lang === 'fr' ? 'Analyse de l\'intention' : (lang === 'ar' ? 'مسح القصد' : (lang === 'tr' ? 'Niyet Taranıyor' : 'Сканирование намерения'))), sub: `Detecting: ${keywordText}` },
    { icon: ScanSearch, label: lang === 'en' ? "Mapping Context" : (lang === 'fr' ? 'Recherche Profonde' : (lang === 'ar' ? 'بحث عميق' : (lang === 'tr' ? 'Bağlam Eşleniyor' : 'Контекст'))), sub: t.loading.Scanning.replace('{platform}', platform) },
    { icon: Database, label: lang === 'en' ? "Structuring Prompt" : (lang === 'fr' ? 'Structuration' : (lang === 'ar' ? 'تنظيم البرومبت' : (lang === 'tr' ? 'Prompt Yapısı' : 'Структура'))), sub: t.loading.Architecting },
    { icon: Cpu, label: lang === 'en' ? "Sharpening Output" : (lang === 'fr' ? 'Optimisation' : (lang === 'ar' ? 'تحسين النتيجة' : (lang === 'tr' ? 'Çıktı Keskinleşiyor' : 'Оптимизация'))), sub: t.loading.Optimizing },
    { icon: BrainCircuit, label: lang === 'en' ? "Ready Soon" : (lang === 'fr' ? 'Bientôt prêt' : (lang === 'ar' ? 'جاهز قريباً' : (lang === 'tr' ? 'Neredeyse Hazır' : 'Почти готово'))), sub: "Polishing the final answer" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1000);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 bg-white/40 dark:bg-black/80 backdrop-blur-3xl overflow-hidden">
      <div className="w-full max-w-lg relative">
        {/* Dynamic Background Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] -z-10">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className={cn(
              "w-full h-full rounded-full blur-[100px]",
              mode === "Code" ? "bg-green-500" : "bg-indigo-500"
            )}
          />
        </div>

        {/* Center Visual */}
        <div className="flex justify-center mb-8 md:mb-16 relative">
          <div className="relative">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className={cn(
                "w-24 h-24 md:w-32 md:h-32 border-2 border-dashed rounded-full flex items-center justify-center",
                mode === "Code" ? "border-green-500/20" : "border-black/5 dark:border-white/5"
              )}
            >
              <div className="w-16 h-16 md:w-24 md:h-24 border border-dashed rounded-full opacity-50" />
            </motion.div>
            
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={cn(
                "absolute inset-0 flex items-center justify-center rounded-2xl md:rounded-3xl shadow-2xl z-10 mx-auto w-12 h-12 md:w-16 md:h-16",
                mode === "Code" ? "bg-green-500" : (mode === "Image" ? "bg-gradient-to-br from-pink-500 to-purple-500" : "bg-black dark:bg-white")
              )}
            >
              <Sparkles className={cn("w-6 h-6 md:w-8 md:h-8", mode === "Code" ? "text-black" : (mode === "Image" ? "text-white" : "text-white dark:text-black"))} />
            </motion.div>

            {/* Orbiting particles */}
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  rotate: 360,
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  rotate: { duration: 5 + i * 2, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }
                }}
                className="absolute inset-0"
              >
                <div className={cn(
                  "w-2 h-2 rounded-full absolute -top-1 left-1/2 -translate-x-1/2",
                  mode === "Code" ? "bg-green-400" : (mode === "Image" ? "bg-pink-400" : "bg-indigo-500")
                )} style={{ 
                  boxShadow: mode === "Code" ? '0 0 15px #4ade80' : (mode === "Image" ? '0 0 15px #f472b6' : 'none'),
                  left: `${40 + i * 10}%`
                }} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Process Steps */}
        {keywords.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-6 px-4">
            {keywords.map((keyword, index) => (
              <motion.span
                key={keyword}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className={cn(
                  "px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest",
                  mode === "Code"
                    ? "border-green-500/20 text-green-500/70 bg-green-500/5"
                    : mode === "Image"
                      ? "border-purple-500/20 text-purple-500 bg-purple-500/5"
                      : "border-neutral-200 dark:border-white/10 text-neutral-500 dark:text-neutral-400 bg-white/50 dark:bg-white/5"
                )}
              >
                {keyword}
              </motion.span>
            ))}
          </div>
        )}

        <div className="space-y-4 md:space-y-8 px-4 md:px-12">
          {steps.map((step, i) => {
            const isActive = i === currentStep;
            const isCompleted = i < currentStep;
            
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ 
                  opacity: isActive || isCompleted ? 1 : 0.3,
                  x: isActive ? 5 : 0,
                  scale: isActive ? 1.02 : 1
                }}
                className="flex items-center gap-4 md:gap-6 relative"
              >
                <div className={cn(
                  "w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl flex items-center justify-center transition-all duration-500",
                  isActive 
                    ? (mode === "Code" ? "bg-green-500 text-black" : "bg-black dark:bg-white text-white dark:text-black") 
                    : (isCompleted 
                        ? (mode === "Code" ? "bg-green-500/20 text-green-500" : "bg-neutral-100 dark:bg-neutral-800 text-green-500") 
                        : "bg-neutral-50 dark:bg-neutral-900 text-neutral-300 dark:text-neutral-700")
                )}>
                  {isCompleted ? <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" /> : <step.icon className="w-4 h-4 md:w-5 md:h-5" />}
                </div>

                <div className="flex-1">
                  <div className={cn(
                    "font-bold uppercase tracking-[0.2em] transition-all",
                    isActive 
                      ? "text-[14px] text-neutral-900 dark:text-white" 
                      : "text-[12px] text-neutral-400"
                  )}>
                    {isActive ? (
                      <FlowingText text={step.label} className={mode === "Code" ? "text-green-500 font-mono" : ""} />
                    ) : (
                      step.label
                    )}
                  </div>
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className={cn(
                          "text-[10px] font-bold uppercase tracking-widest mt-1",
                          mode === "Code" ? "text-green-500/50 font-mono" : "text-neutral-400 dark:text-neutral-500"
                        )}
                      >
                        {step.sub}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                {/* Connecting Line */}
                {i < steps.length - 1 && (
                  <div className="absolute left-5 top-12 w-[1px] h-4 bg-neutral-100 dark:bg-neutral-800" />
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="mt-12 md:mt-20 flex flex-col items-center gap-5">
          <div className="w-full max-w-xs bg-neutral-100 dark:bg-neutral-900 h-1 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 4, ease: "linear" }}
              className={cn(
                "h-full",
                mode === "Code" ? "bg-green-500" : "bg-black dark:bg-white"
              )}
            />
          </div>
          <motion.div 
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className={cn(
              "text-[10px] font-black uppercase tracking-[0.4em]",
              mode === "Code" ? "text-green-500 font-mono" : "text-neutral-400"
            )}
          >
            {currentStep >= steps.length - 1 ? "Almost ready" : t.labels.Forging}
          </motion.div>
        </div>
      </div>
    </div>
  );
};
